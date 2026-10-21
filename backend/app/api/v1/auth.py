from __future__ import annotations

from datetime import UTC, datetime, timedelta
from uuid import UUID

from fastapi import APIRouter, Cookie, Depends, HTTPException, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.rate_limit import rate_limit
from app.core.security import (
    create_token,
    decode_token,
    fingerprints_match,
    hash_password,
    token_fingerprint,
    verify_password,
)
from app.db.session import get_db
from app.models.entities import RefreshToken, User
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse, UserResponse

router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=False)
REFRESH_COOKIE_NAME = "campus_space_refresh_token"


def credentials_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    if credentials is None:
        raise credentials_error()
    try:
        payload = decode_token(credentials.credentials, "access")
        user_id = UUID(payload["sub"])
    except (ValueError, KeyError):
        raise credentials_error() from None
    user = await db.get(User, user_id)
    if user is None or not user.is_active:
        raise credentials_error()
    return user


async def issue_tokens(db: AsyncSession, user: User) -> tuple[str, datetime]:
    refresh_token, token_id, refresh_expires_at = create_token(
        str(user.id), "refresh", timedelta(days=settings.refresh_token_expire_days)
    )
    db.add(
        RefreshToken(
            user_id=user.id,
            token_id=token_id,
            token_hash=token_fingerprint(refresh_token),
            expires_at=refresh_expires_at,
        )
    )
    return refresh_token, refresh_expires_at


def access_token_for(user: User) -> str:
    token, _, _ = create_token(
        str(user.id), "access", timedelta(minutes=settings.access_token_expire_minutes)
    )
    return token


def set_refresh_cookie(response: Response, refresh_token: str, expires_at: datetime) -> None:
    max_age = max(0, int((expires_at - datetime.now(UTC)).total_seconds()))
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        max_age=max_age,
        httponly=True,
        secure=settings.cookie_secure,
        samesite="lax",
        path="/",
    )


def token_response(user: User) -> TokenResponse:
    return TokenResponse(
        access_token=access_token_for(user),
        expires_in=settings.access_token_expire_minutes * 60,
        user=UserResponse.model_validate(user),
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(rate_limit("register", 5, 3600))])
async def register(payload: RegisterRequest, response: Response, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    user = User(email=payload.email, password_hash=hash_password(payload.password), full_name=payload.full_name.strip(), role=payload.role)
    db.add(user)
    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email is already registered") from None
    refresh_token, refresh_expires_at = await issue_tokens(db, user)
    await db.commit()
    await db.refresh(user)
    set_refresh_cookie(response, refresh_token, refresh_expires_at)
    return token_response(user)


@router.post("/login", response_model=TokenResponse, dependencies=[Depends(rate_limit("login", 5, 900))])
async def login(payload: LoginRequest, response: Response, db: AsyncSession = Depends(get_db)) -> TokenResponse:
    user = await db.scalar(select(User).where(User.email == payload.email))
    if user is None or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    refresh_token, refresh_expires_at = await issue_tokens(db, user)
    await db.commit()
    set_refresh_cookie(response, refresh_token, refresh_expires_at)
    return token_response(user)


@router.post("/refresh", response_model=TokenResponse)
async def refresh(
    payload: RefreshRequest,
    response: Response,
    refresh_cookie: str | None = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    refresh_token = payload.refresh_token or refresh_cookie
    if refresh_token is None:
        raise credentials_error()
    try:
        token_payload = decode_token(refresh_token, "refresh")
        token_id = token_payload["jti"]
        user_id = UUID(token_payload["sub"])
    except (ValueError, KeyError):
        raise credentials_error() from None
    stored_token = await db.scalar(select(RefreshToken).where(RefreshToken.token_id == token_id))
    if (
        stored_token is None
        or stored_token.user_id != user_id
        or stored_token.revoked_at is not None
        or stored_token.expires_at <= datetime.now(UTC)
        or not fingerprints_match(refresh_token, stored_token.token_hash)
    ):
        raise credentials_error()
    user = await db.get(User, user_id)
    if user is None or not user.is_active:
        raise credentials_error()
    stored_token.revoked_at = datetime.now(UTC)
    new_refresh_token, refresh_expires_at = await issue_tokens(db, user)
    await db.commit()
    set_refresh_cookie(response, new_refresh_token, refresh_expires_at)
    return token_response(user)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
async def logout(
    payload: RefreshRequest,
    response: Response,
    refresh_cookie: str | None = Cookie(default=None, alias=REFRESH_COOKIE_NAME),
    db: AsyncSession = Depends(get_db),
) -> Response:
    refresh_token = payload.refresh_token or refresh_cookie
    if refresh_token:
        try:
            token_payload = decode_token(refresh_token, "refresh")
            stored_token = await db.scalar(select(RefreshToken).where(RefreshToken.token_id == token_payload["jti"]))
            if stored_token and fingerprints_match(refresh_token, stored_token.token_hash):
                stored_token.revoked_at = datetime.now(UTC)
                await db.commit()
        except (ValueError, KeyError):
            pass
    response.delete_cookie(REFRESH_COOKIE_NAME, path="/")
    return response


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)) -> User:
    return current_user

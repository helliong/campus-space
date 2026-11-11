from __future__ import annotations

from datetime import UTC, datetime, timedelta
from io import BytesIO
from pathlib import Path
from time import time
from uuid import UUID

from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from PIL import Image, ImageOps, UnidentifiedImageError
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.media import AVATAR_DIRECTORY
from app.core.rate_limit import (
    check_login_rate_limit,
    clear_failed_logins,
    rate_limit,
    record_failed_login,
)
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
from app.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
    UserResponse,
    UserSettingsUpdate,
)

router = APIRouter()
bearer_scheme = HTTPBearer(auto_error=False)
REFRESH_COOKIE_NAME = "campus_space_refresh_token"
MAX_AVATAR_SIZE = 5 * 1024 * 1024
MAX_AVATAR_PIXELS = 25_000_000
AVATAR_DIMENSION = 512
AVATAR_WEBP_QUALITY = 70
AVATAR_CONTENT_TYPES = {"image/jpeg", "image/png", "image/webp"}


def avatar_to_webp(data: bytes) -> bytes:
    try:
        with Image.open(BytesIO(data)) as source:
            if source.width * source.height > MAX_AVATAR_PIXELS:
                raise ValueError("Image dimensions are too large")
            source.seek(0)
            oriented = ImageOps.exif_transpose(source)
            mode = "RGBA" if "A" in oriented.getbands() else "RGB"
            normalized = ImageOps.fit(
                oriented.convert(mode),
                (AVATAR_DIMENSION, AVATAR_DIMENSION),
                method=Image.Resampling.LANCZOS,
            )
            output = BytesIO()
            normalized.save(
                output,
                format="WEBP",
                quality=AVATAR_WEBP_QUALITY,
                method=6,
            )
            return output.getvalue()
    except (Image.DecompressionBombError, UnidentifiedImageError, OSError, ValueError) as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Файл не является корректным изображением JPEG, PNG или WebP",
        ) from exc


def remove_avatar_files(user_id: UUID, keep: Path | None = None) -> None:
    for extension in ("jpg", "png", "webp"):
        candidate = AVATAR_DIRECTORY / f"{user_id}.{extension}"
        if candidate != keep:
            candidate.unlink(missing_ok=True)


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
        token_version = int(payload.get("ver", 0))
    except (ValueError, KeyError, TypeError):
        raise credentials_error() from None
    user = await db.get(User, user_id)
    if (
        user is None
        or not user.is_active
        or token_version != user.auth_version
    ):
        raise credentials_error()
    return user


async def issue_tokens(db: AsyncSession, user: User) -> tuple[str, datetime]:
    refresh_token, token_id, refresh_expires_at = create_token(
        str(user.id),
        "refresh",
        timedelta(days=settings.refresh_token_expire_days),
        {"ver": user.auth_version},
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
        str(user.id),
        "access",
        timedelta(minutes=settings.access_token_expire_minutes),
        {"ver": user.auth_version},
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


async def revoke_user_refresh_tokens(db: AsyncSession, user_id: UUID) -> None:
    await db.execute(
        update(RefreshToken)
        .where(RefreshToken.user_id == user_id, RefreshToken.revoked_at.is_(None))
        .values(revoked_at=datetime.now(UTC))
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


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    rate_limit_key = await check_login_rate_limit(request, payload.email, limit=5)
    user = await db.scalar(select(User).where(User.email == payload.email))
    if user is None or not user.is_active or not verify_password(payload.password, user.password_hash):
        await record_failed_login(rate_limit_key, window_seconds=900)
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password")
    await clear_failed_logins(rate_limit_key)
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
        token_version = int(token_payload.get("ver", 0))
    except (ValueError, KeyError, TypeError):
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
    if (
        user is None
        or not user.is_active
        or token_version != user.auth_version
    ):
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


@router.patch("/me", response_model=UserResponse)
async def update_me(
    payload: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    for field, value in payload.model_dump(exclude_unset=True, exclude_none=True).items():
        setattr(current_user, field, value)
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.put("/me/avatar", response_model=UserResponse)
async def upload_avatar(
    request: Request,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    if request.headers.get("content-type", "").split(";", 1)[0].lower() not in AVATAR_CONTENT_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Поддерживаются только изображения JPEG, PNG и WebP",
        )

    content = bytearray()
    async for chunk in request.stream():
        content.extend(chunk)
        if len(content) > MAX_AVATAR_SIZE:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="Размер изображения не должен превышать 5 МБ",
            )

    webp_content = avatar_to_webp(bytes(content))
    target = AVATAR_DIRECTORY / f"{current_user.id}.webp"
    temporary = AVATAR_DIRECTORY / f".{current_user.id}.webp.tmp"
    temporary.write_bytes(webp_content)
    temporary.replace(target)
    remove_avatar_files(current_user.id, keep=target)

    current_user.avatar_url = f"/uploads/avatars/{target.name}?v={int(time())}"
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.delete("/me/avatar", response_model=UserResponse)
async def delete_avatar(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    remove_avatar_files(current_user.id)
    current_user.avatar_url = None
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.post(
    "/change-password",
    response_model=TokenResponse,
    dependencies=[Depends(rate_limit("change-password", 10, 900))],
)
async def change_password(
    payload: ChangePasswordRequest,
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    if not verify_password(payload.current_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Текущий пароль указан неверно",
        )
    if verify_password(payload.new_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Новый пароль должен отличаться от текущего",
        )

    current_user.password_hash = hash_password(payload.new_password)
    current_user.auth_version += 1
    await revoke_user_refresh_tokens(db, current_user.id)
    refresh_token, refresh_expires_at = await issue_tokens(db, current_user)
    await db.commit()
    set_refresh_cookie(response, refresh_token, refresh_expires_at)
    return token_response(current_user)


@router.post("/logout-all", status_code=status.HTTP_204_NO_CONTENT)
async def logout_all(
    response: Response,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    current_user.auth_version += 1
    await revoke_user_refresh_tokens(db, current_user.id)
    await db.commit()
    response.delete_cookie(REFRESH_COOKIE_NAME, path="/")
    return response

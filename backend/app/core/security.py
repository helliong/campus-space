"""Password and JWT helpers."""

from __future__ import annotations

import hashlib
import hmac
from datetime import UTC, datetime, timedelta
from typing import Any
from uuid import uuid4

import jwt
from jwt import InvalidTokenError
from pwdlib import PasswordHash

from app.core.config import settings

password_hasher = PasswordHash.recommended()


def hash_password(password: str) -> str:
    return password_hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    return password_hasher.verify(password, password_hash)


def create_token(subject: str, token_type: str, expires_delta: timedelta) -> tuple[str, str, datetime]:
    now = datetime.now(UTC)
    expires_at = now + expires_delta
    token_id = str(uuid4())
    payload = {"sub": subject, "type": token_type, "jti": token_id, "iat": now, "exp": expires_at}
    token = jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)
    return token, token_id, expires_at


def decode_token(token: str, expected_type: str) -> dict[str, Any]:
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except InvalidTokenError as exc:
        raise ValueError("Invalid or expired token") from exc
    if payload.get("type") != expected_type or not payload.get("sub") or not payload.get("jti"):
        raise ValueError("Invalid token type")
    return payload


def token_fingerprint(token: str) -> str:
    return hmac.new(settings.jwt_secret_key.encode(), token.encode(), hashlib.sha256).hexdigest()


def fingerprints_match(token: str, fingerprint: str) -> bool:
    return hmac.compare_digest(token_fingerprint(token), fingerprint)

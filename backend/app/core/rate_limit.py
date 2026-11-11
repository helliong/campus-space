"""Small Redis-backed fixed-window rate limiter for sensitive endpoints."""

from __future__ import annotations

from collections.abc import Awaitable, Callable
from hashlib import sha256

from fastapi import HTTPException, Request, status
from redis import RedisError
from redis.asyncio import Redis

from app.core.config import settings

redis_client = Redis.from_url(settings.redis_url, encoding="utf-8", decode_responses=True)


def login_rate_limit_key(request: Request, email: str) -> str:
    """Keep login limits isolated per client and account without storing the email."""
    client_ip = request.client.host if request.client else "unknown"
    email_hash = sha256(email.strip().lower().encode("utf-8")).hexdigest()
    return f"rate-limit:login:{client_ip}:{email_hash}"


async def check_login_rate_limit(request: Request, email: str, limit: int) -> str:
    key = login_rate_limit_key(request, email)
    try:
        attempts = int(await redis_client.get(key) or 0)
        if attempts >= limit:
            retry_after = max(1, await redis_client.ttl(key))
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Too many failed login attempts. Try again later.",
                headers={"Retry-After": str(retry_after)},
            )
    except RedisError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Rate limiting service is unavailable.",
        ) from exc
    return key


async def record_failed_login(key: str, window_seconds: int) -> None:
    try:
        attempts = await redis_client.incr(key)
        if attempts == 1:
            await redis_client.expire(key, window_seconds)
    except RedisError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Rate limiting service is unavailable.",
        ) from exc


async def clear_failed_logins(key: str) -> None:
    try:
        await redis_client.delete(key)
    except RedisError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Rate limiting service is unavailable.",
        ) from exc


def rate_limit(scope: str, limit: int, window_seconds: int) -> Callable[[Request], Awaitable[None]]:
    async def check(request: Request) -> None:
        client_ip = request.client.host if request.client else "unknown"
        key = f"rate-limit:{scope}:{client_ip}"
        try:
            attempts = await redis_client.incr(key)
            if attempts == 1:
                await redis_client.expire(key, window_seconds)
            if attempts > limit:
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail="Too many requests. Try again later.",
                    headers={"Retry-After": str(window_seconds)},
                )
        except RedisError as exc:
            raise HTTPException(
                status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
                detail="Rate limiting service is unavailable.",
            ) from exc

    return check

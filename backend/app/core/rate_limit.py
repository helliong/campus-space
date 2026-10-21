"""Small Redis-backed fixed-window rate limiter for sensitive endpoints."""

from __future__ import annotations

from collections.abc import Awaitable, Callable

from fastapi import HTTPException, Request, status
from redis import RedisError
from redis.asyncio import Redis

from app.core.config import settings

redis_client = Redis.from_url(settings.redis_url, encoding="utf-8", decode_responses=True)


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

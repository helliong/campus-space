from contextlib import asynccontextmanager
from collections.abc import AsyncIterator
import mimetypes

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.router import api_router
from app.core.config import settings
from app.core.media import UPLOAD_DIRECTORY
from app.db.base import Base
from app.db.catalog import ensure_campus_catalog
from app.db.session import async_session_factory, engine


@asynccontextmanager
async def lifespan(_: FastAPI) -> AsyncIterator[None]:
    # Keep local/dev databases usable even when a running container has not
    # applied the latest additive migrations yet. Alembic remains the source
    # of truth for production schema changes.
    async with engine.begin() as connection:
        await connection.run_sync(Base.metadata.create_all)
    async with async_session_factory() as session:
        await ensure_campus_catalog(session)
    yield


mimetypes.add_type("image/webp", ".webp")

app = FastAPI(title=settings.app_name, version="0.1.0", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix=settings.api_v1_prefix)
app.mount("/uploads", StaticFiles(directory=str(UPLOAD_DIRECTORY)), name="uploads")


@app.get("/health", tags=["system"])
async def healthcheck() -> dict[str, str]:
    return {"status": "ok"}

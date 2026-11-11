from pathlib import Path

from app.core.config import settings


UPLOAD_DIRECTORY = Path(settings.upload_directory)
AVATAR_DIRECTORY = UPLOAD_DIRECTORY / "avatars"

AVATAR_DIRECTORY.mkdir(parents=True, exist_ok=True)

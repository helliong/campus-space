from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import models so Alembic can discover all tables through Base.metadata.
from app.models import entities  # noqa: E402, F401

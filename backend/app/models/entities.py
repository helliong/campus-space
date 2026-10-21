"""Core database entities for the CampusSpace domain."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID, uuid4

from sqlalchemy import Boolean, CheckConstraint, DateTime, ForeignKey, Integer, Numeric, String, Text, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class TimestampMixin:
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class User(TimestampMixin, Base):
    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(Text)
    full_name: Mapped[str] = mapped_column(String(200))
    role: Mapped[str] = mapped_column(String(20), default="student")
    faculty: Mapped[str | None] = mapped_column(String(200))
    group_name: Mapped[str | None] = mapped_column(String(100))
    phone: Mapped[str | None] = mapped_column(String(32))
    avatar_url: Mapped[str | None] = mapped_column(Text)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)

    bookings: Mapped[list[Booking]] = relationship(back_populates="user")
    refresh_tokens: Mapped[list[RefreshToken]] = relationship(back_populates="user")


class Building(TimestampMixin, Base):
    __tablename__ = "buildings"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    code: Mapped[str] = mapped_column(String(32), unique=True)
    name: Mapped[str] = mapped_column(String(200))
    address: Mapped[str | None] = mapped_column(String(300))

    floors: Mapped[list[Floor]] = relationship(back_populates="building")


class Floor(TimestampMixin, Base):
    __tablename__ = "floors"
    __table_args__ = (UniqueConstraint("building_id", "number", name="uq_floors_building_number"),)

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    building_id: Mapped[UUID] = mapped_column(ForeignKey("buildings.id", ondelete="CASCADE"))
    number: Mapped[int] = mapped_column(Integer)
    plan_image_url: Mapped[str | None] = mapped_column(Text)

    building: Mapped[Building] = relationship(back_populates="floors")
    spaces: Mapped[list[Space]] = relationship(back_populates="floor")


class Space(TimestampMixin, Base):
    __tablename__ = "spaces"
    __table_args__ = (
        UniqueConstraint("floor_id", "code", name="uq_spaces_floor_code"),
        CheckConstraint("capacity > 0", name="ck_spaces_capacity_positive"),
    )

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    floor_id: Mapped[UUID] = mapped_column(ForeignKey("floors.id", ondelete="CASCADE"), index=True)
    code: Mapped[str] = mapped_column(String(64))
    name: Mapped[str] = mapped_column(String(200))
    space_type: Mapped[str] = mapped_column(String(32))
    capacity: Mapped[int] = mapped_column(Integer)
    description: Mapped[str | None] = mapped_column(Text)
    access_policy: Mapped[str] = mapped_column(String(32), default="public")
    requires_approval: Mapped[bool] = mapped_column(Boolean, default=False)
    image_url: Mapped[str | None] = mapped_column(Text)
    map_x: Mapped[float | None] = mapped_column(Numeric(8, 2))
    map_y: Mapped[float | None] = mapped_column(Numeric(8, 2))

    floor: Mapped[Floor] = relationship(back_populates="spaces")
    workplaces: Mapped[list[Workplace]] = relationship(back_populates="space")
    amenities: Mapped[list[SpaceAmenity]] = relationship(back_populates="space")
    bookings: Mapped[list[Booking]] = relationship(back_populates="space")


class Workplace(TimestampMixin, Base):
    __tablename__ = "workplaces"
    __table_args__ = (UniqueConstraint("space_id", "code", name="uq_workplaces_space_code"),)

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    space_id: Mapped[UUID] = mapped_column(ForeignKey("spaces.id", ondelete="CASCADE"), index=True)
    code: Mapped[str] = mapped_column(String(64))
    kind: Mapped[str] = mapped_column(String(32), default="desk")
    has_computer: Mapped[bool] = mapped_column(Boolean, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    map_x: Mapped[float | None] = mapped_column(Numeric(8, 2))
    map_y: Mapped[float | None] = mapped_column(Numeric(8, 2))

    space: Mapped[Space] = relationship(back_populates="workplaces")
    bookings: Mapped[list[Booking]] = relationship(back_populates="workplace")


class Amenity(Base):
    __tablename__ = "amenities"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    code: Mapped[str] = mapped_column(String(64), unique=True)
    name: Mapped[str] = mapped_column(String(100))

    spaces: Mapped[list[SpaceAmenity]] = relationship(back_populates="amenity")


class SpaceAmenity(Base):
    __tablename__ = "space_amenities"

    space_id: Mapped[UUID] = mapped_column(ForeignKey("spaces.id", ondelete="CASCADE"), primary_key=True)
    amenity_id: Mapped[UUID] = mapped_column(ForeignKey("amenities.id", ondelete="CASCADE"), primary_key=True)

    space: Mapped[Space] = relationship(back_populates="amenities")
    amenity: Mapped[Amenity] = relationship(back_populates="spaces")


class Booking(TimestampMixin, Base):
    __tablename__ = "bookings"
    __table_args__ = (
        CheckConstraint("starts_at < ends_at", name="ck_bookings_valid_period"),
        CheckConstraint(
            "(space_id IS NOT NULL AND workplace_id IS NULL) OR (space_id IS NULL AND workplace_id IS NOT NULL)",
            name="ck_bookings_exactly_one_target",
        ),
    )

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="RESTRICT"), index=True)
    space_id: Mapped[UUID | None] = mapped_column(ForeignKey("spaces.id", ondelete="RESTRICT"), index=True)
    workplace_id: Mapped[UUID | None] = mapped_column(ForeignKey("workplaces.id", ondelete="RESTRICT"), index=True)
    starts_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    ends_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    purpose: Mapped[str | None] = mapped_column(Text)
    status: Mapped[str] = mapped_column(String(20), default="pending", index=True)
    admin_comment: Mapped[str | None] = mapped_column(Text)
    cancelled_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))

    user: Mapped[User] = relationship(back_populates="bookings")
    space: Mapped[Space | None] = relationship(back_populates="bookings")
    workplace: Mapped[Workplace | None] = relationship(back_populates="bookings")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[UUID] = mapped_column(PG_UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id: Mapped[UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    token_id: Mapped[str] = mapped_column(String(36), unique=True)
    token_hash: Mapped[str] = mapped_column(String(64))
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), index=True)
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)

    user: Mapped[User] = relationship(back_populates="refresh_tokens")

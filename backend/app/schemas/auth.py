from __future__ import annotations

import re
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, field_validator


class RegisterRequest(BaseModel):
    email: str = Field(max_length=320)
    password: str = Field(min_length=8, max_length=128)
    full_name: str = Field(min_length=2, max_length=200)
    role: str = "student"

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        email = value.strip().lower()
        if not re.fullmatch(r"[^\s@]+@[^\s@]+\.[^\s@]+", email):
            raise ValueError("Invalid email address")
        return email

    @field_validator("role")
    @classmethod
    def validate_role(cls, value: str) -> str:
        if value not in {"student", "teacher"}:
            raise ValueError("Only student and teacher roles can be registered")
        return value


class LoginRequest(BaseModel):
    email: str = Field(max_length=320)
    password: str = Field(min_length=1, max_length=128)

    @field_validator("email")
    @classmethod
    def normalize_email(cls, value: str) -> str:
        return value.strip().lower()


class RefreshRequest(BaseModel):
    refresh_token: str | None = None


class UserSettingsUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=200)
    notify_booking_status: bool | None = None
    notify_booking_reminder: bool | None = None
    notify_booking_cancellation: bool | None = None

    @field_validator("full_name")
    @classmethod
    def normalize_full_name(cls, value: str | None) -> str | None:
        if value is None:
            return None
        normalized = " ".join(value.strip().split())
        if len(normalized) < 2:
            raise ValueError("Full name is too short")
        return normalized


class ChangePasswordRequest(BaseModel):
    current_password: str = Field(min_length=1, max_length=128)
    new_password: str = Field(min_length=8, max_length=128)


class UserResponse(BaseModel):
    id: UUID
    email: str
    full_name: str
    role: str
    faculty: str | None
    group_name: str | None
    phone: str | None
    avatar_url: str | None
    notify_booking_status: bool
    notify_booking_reminder: bool
    notify_booking_cancellation: bool
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int
    user: UserResponse

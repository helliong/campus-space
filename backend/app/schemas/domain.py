from __future__ import annotations

from datetime import datetime
from typing import Self
from uuid import UUID

from pydantic import BaseModel, Field, model_validator


class WorkplaceResponse(BaseModel):
    id: UUID
    code: str
    kind: str
    has_computer: bool
    map_x: float | None
    map_y: float | None
    is_available: bool


class SpaceResponse(BaseModel):
    id: UUID
    code: str
    name: str
    space_type: str
    capacity: int
    description: str | None
    access_policy: str
    requires_approval: bool
    image_url: str | None
    images: list[str]
    map_x: float | None
    map_y: float | None
    building_code: str
    building_name: str
    floor_number: int
    amenities: list[str]
    workplaces: list[WorkplaceResponse]
    rating_average: float | None
    review_count: int
    is_available: bool


class BookingCreate(BaseModel):
    space_id: UUID | None = None
    workplace_id: UUID | None = None
    starts_at: datetime
    ends_at: datetime
    purpose: str | None = Field(default=None, max_length=1000)

    @model_validator(mode="after")
    def validate_target_and_period(self) -> Self:
        if (self.space_id is None) == (self.workplace_id is None):
            raise ValueError("Choose exactly one space or workplace")
        if self.starts_at >= self.ends_at:
            raise ValueError("Booking end must be after start")
        return self


class BookingResponse(BaseModel):
    id: UUID
    starts_at: datetime
    ends_at: datetime
    purpose: str | None
    status: str
    admin_comment: str | None
    cancelled_at: datetime | None
    created_at: datetime
    space_id: UUID
    space_code: str
    space_name: str
    space_type: str
    workplace_id: UUID | None
    workplace_code: str | None
    building_code: str
    floor_number: int
    can_review: bool
    has_review: bool


class ReviewCreate(BaseModel):
    booking_id: UUID
    score: int = Field(ge=1, le=5)
    cleanliness: int = Field(ge=1, le=5)
    equipment: int = Field(ge=1, le=5)
    comfort: int = Field(ge=1, le=5)
    text: str = Field(min_length=10, max_length=3000)


class ReviewResponse(BaseModel):
    id: UUID
    booking_id: UUID
    space_id: UUID
    space_code: str
    space_name: str
    author_name: str
    author_role: str
    score: int
    cleanliness: int
    equipment: int
    comfort: int
    text: str
    created_at: datetime
    verified_booking: bool = True


class ReviewMetrics(BaseModel):
    average: float | None
    cleanliness: float | None
    equipment: float | None
    comfort: float | None
    total: int
    distribution: dict[int, int]


class ReviewCollection(BaseModel):
    metrics: ReviewMetrics
    items: list[ReviewResponse]

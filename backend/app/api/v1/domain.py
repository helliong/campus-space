from __future__ import annotations

from collections import Counter
from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import Load, selectinload

from app.api.v1.auth import get_current_user
from app.db.session import get_db
from app.models.entities import Booking, Favorite, Floor, Review, Space, SpaceAmenity, User, Workplace
from app.schemas.domain import (
    BookingCreate,
    BookingResponse,
    ReviewCollection,
    ReviewCreate,
    ReviewMetrics,
    ReviewResponse,
    SpaceResponse,
    WorkplaceResponse,
)

router = APIRouter()
ACTIVE_BOOKING_STATUSES = {"pending", "confirmed"}


def active_booking_overlap_conditions(starts_at: datetime, ends_at: datetime) -> list[object]:
    return [
        Booking.status.in_(ACTIVE_BOOKING_STATUSES),
        Booking.starts_at < ends_at,
        Booking.ends_at > starts_at,
    ]


async def user_has_overlapping_booking(
    db: AsyncSession,
    user_id: UUID,
    starts_at: datetime,
    ends_at: datetime,
) -> bool:
    return (
        await db.scalar(
            select(Booking.id)
            .where(
                Booking.user_id == user_id,
                *active_booking_overlap_conditions(starts_at, ends_at),
            )
            .limit(1)
        )
    ) is not None


def space_options() -> tuple[Load, ...]:
    return (
        selectinload(Space.floor).selectinload(Floor.building),
        selectinload(Space.images),
        selectinload(Space.workplaces),
        selectinload(Space.amenities).selectinload(SpaceAmenity.amenity),
        selectinload(Space.reviews),
    )


def booking_options() -> tuple[Load, ...]:
    return (
        selectinload(Booking.space).selectinload(Space.floor).selectinload(Floor.building),
        selectinload(Booking.workplace).selectinload(Workplace.space).selectinload(Space.floor).selectinload(Floor.building),
        selectinload(Booking.review),
    )


async def occupied_targets(db: AsyncSession, at: datetime, until: datetime | None = None) -> tuple[set[UUID], set[UUID]]:
    result = await db.scalars(
        select(Booking).where(
            Booking.status.in_(ACTIVE_BOOKING_STATUSES),
            Booking.starts_at < until if until is not None else Booking.starts_at <= at,
            Booking.ends_at > at,
        )
    )
    bookings = result.all()
    return (
        {booking.space_id for booking in bookings if booking.space_id is not None},
        {booking.workplace_id for booking in bookings if booking.workplace_id is not None},
    )


def serialize_space(space: Space, busy_spaces: set[UUID], busy_workplaces: set[UUID]) -> SpaceResponse:
    published_reviews = [review for review in space.reviews if review.is_published]
    rating = sum(review.score for review in published_reviews) / len(published_reviews) if published_reviews else None
    workplaces = [
        WorkplaceResponse(
            id=workplace.id,
            code=workplace.code,
            kind=workplace.kind,
            has_computer=workplace.has_computer,
            map_x=float(workplace.map_x) if workplace.map_x is not None else None,
            map_y=float(workplace.map_y) if workplace.map_y is not None else None,
            is_available=workplace.is_active and workplace.id not in busy_workplaces and space.id not in busy_spaces,
        )
        for workplace in space.workplaces
        if workplace.is_active
    ]
    has_available_workplace = any(workplace.is_available for workplace in workplaces)
    is_available = space.id not in busy_spaces and (not workplaces or has_available_workplace)
    return SpaceResponse(
        id=space.id,
        code=space.code,
        name=space.name,
        space_type=space.space_type,
        capacity=space.capacity,
        description=space.description,
        access_policy=space.access_policy,
        requires_approval=space.requires_approval,
        image_url=space.image_url,
        images=[image.image_url for image in space.images],
        map_x=float(space.map_x) if space.map_x is not None else None,
        map_y=float(space.map_y) if space.map_y is not None else None,
        building_code=space.floor.building.code,
        building_name=space.floor.building.name,
        floor_number=space.floor.number,
        amenities=sorted(link.amenity.name for link in space.amenities),
        workplaces=workplaces,
        rating_average=round(rating, 1) if rating is not None else None,
        review_count=len(published_reviews),
        is_available=is_available,
    )


def serialize_booking(booking: Booking) -> BookingResponse:
    workplace = booking.workplace
    if booking.space is not None:
        space = booking.space
    elif workplace is not None:
        space = workplace.space
    else:
        raise RuntimeError("Booking has no target")
    now = datetime.now(UTC)
    return BookingResponse(
        id=booking.id,
        starts_at=booking.starts_at,
        ends_at=booking.ends_at,
        purpose=booking.purpose,
        status=booking.status,
        admin_comment=booking.admin_comment,
        cancelled_at=booking.cancelled_at,
        created_at=booking.created_at,
        space_id=space.id,
        space_code=space.code,
        space_name=space.name,
        space_type=space.space_type,
        workplace_id=workplace.id if workplace is not None else None,
        workplace_code=workplace.code if workplace is not None else None,
        building_code=space.floor.building.code,
        floor_number=space.floor.number,
        can_review=booking.ends_at <= now and booking.status == "confirmed" and booking.review is None,
        has_review=booking.review is not None,
    )


def public_author_name(user: User) -> str:
    parts = user.full_name.strip().split()
    if not parts:
        return "Пользователь"
    if len(parts) == 1:
        return parts[0]
    return f"{parts[0]} {parts[1][0]}."


def serialize_review(review: Review) -> ReviewResponse:
    return ReviewResponse(
        id=review.id,
        booking_id=review.booking_id,
        space_id=review.space_id,
        space_code=review.space.code,
        space_name=review.space.name,
        author_name=public_author_name(review.user),
        author_role=review.user.role,
        score=review.score,
        cleanliness=review.cleanliness,
        equipment=review.equipment,
        comfort=review.comfort,
        text=review.text,
        created_at=review.created_at,
    )


@router.get("/spaces", response_model=list[SpaceResponse])
async def list_spaces(
    building: str | None = None,
    floor: int | None = None,
    space_type: str | None = None,
    only_available: bool = False,
    at: datetime | None = None,
    until: datetime | None = None,
    db: AsyncSession = Depends(get_db),
) -> list[SpaceResponse]:
    at = at or datetime.now(UTC)
    if at.tzinfo is None:
        at = at.replace(tzinfo=UTC)
    if until is not None:
        if until.tzinfo is None:
            until = until.replace(tzinfo=UTC)
        if until <= at:
            raise HTTPException(status_code=422, detail="until must be after at")
    query = select(Space).join(Space.floor).join(Floor.building).options(*space_options()).order_by(Space.code)
    if building:
        query = query.where(Floor.building.has(code=building))
    if floor is not None:
        query = query.where(Floor.number == floor)
    if space_type:
        query = query.where(Space.space_type == space_type)
    spaces = (await db.scalars(query)).unique().all()
    busy_spaces, busy_workplaces = await occupied_targets(db, at, until)
    result = [serialize_space(space, busy_spaces, busy_workplaces) for space in spaces]
    return [space for space in result if space.is_available] if only_available else result


@router.get("/spaces/{space_id}", response_model=SpaceResponse)
async def get_space(space_id: UUID, db: AsyncSession = Depends(get_db)) -> SpaceResponse:
    space = await db.scalar(select(Space).where(Space.id == space_id).options(*space_options()))
    if space is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Space not found")
    busy_spaces, busy_workplaces = await occupied_targets(db, datetime.now(UTC))
    return serialize_space(space, busy_spaces, busy_workplaces)


@router.get("/bookings/me", response_model=list[BookingResponse])
async def my_bookings(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> list[BookingResponse]:
    bookings = (
        await db.scalars(
            select(Booking)
            .where(Booking.user_id == current_user.id)
            .options(*booking_options())
            .order_by(Booking.starts_at.desc())
        )
    ).unique().all()
    return [serialize_booking(booking) for booking in bookings]


@router.post("/bookings", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    payload: BookingCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BookingResponse:
    if payload.starts_at <= datetime.now(UTC):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Нельзя забронировать прошедшие дату и время",
        )

    space: Space | None = None
    workplace: Workplace | None = None
    if payload.space_id is not None:
        space = await db.get(Space, payload.space_id)
    else:
        workplace = await db.scalar(
            select(Workplace).where(Workplace.id == payload.workplace_id).options(selectinload(Workplace.space))
        )
        if workplace is not None and not workplace.is_active:
            workplace = None
        space = workplace.space if workplace is not None else None
    if space is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking target not found")

    # Serialize booking attempts from the same user so two concurrent requests
    # cannot both pass the overlap check.
    await db.execute(select(User.id).where(User.id == current_user.id).with_for_update())
    if await user_has_overlapping_booking(
        db,
        current_user.id,
        payload.starts_at,
        payload.ends_at,
    ):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="На это время у вас уже есть бронь компьютера или аудитории",
        )

    overlap_conditions = active_booking_overlap_conditions(payload.starts_at, payload.ends_at)
    if workplace is not None:
        overlap_conditions.append(Booking.workplace_id == workplace.id)
    else:
        overlap_conditions.append(Booking.space_id == space.id)
    if await db.scalar(select(Booking.id).where(*overlap_conditions).limit(1)) is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Selected time is no longer available")

    booking = Booking(
        user_id=current_user.id,
        space_id=space.id if workplace is None else None,
        workplace_id=workplace.id if workplace is not None else None,
        starts_at=payload.starts_at,
        ends_at=payload.ends_at,
        purpose=payload.purpose,
        status="pending" if space.requires_approval else "confirmed",
    )
    db.add(booking)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Selected time is no longer available") from None
    loaded = await db.scalar(select(Booking).where(Booking.id == booking.id).options(*booking_options()))
    if loaded is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Booking could not be loaded")
    return serialize_booking(loaded)


@router.patch("/bookings/{booking_id}/cancel", response_model=BookingResponse)
async def cancel_booking(
    booking_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> BookingResponse:
    booking = await db.scalar(
        select(Booking)
        .where(Booking.id == booking_id, Booking.user_id == current_user.id)
        .options(*booking_options())
    )
    if booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if booking.status not in ACTIVE_BOOKING_STATUSES:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Booking cannot be cancelled")
    booking.status = "cancelled"
    booking.cancelled_at = datetime.now(UTC)
    await db.commit()
    return serialize_booking(booking)


@router.get("/favorites", response_model=list[SpaceResponse])
async def list_favorites(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> list[SpaceResponse]:
    spaces = (
        await db.scalars(
            select(Space)
            .join(Favorite, Favorite.space_id == Space.id)
            .where(Favorite.user_id == current_user.id)
            .options(*space_options())
            .order_by(Favorite.created_at.desc())
        )
    ).unique().all()
    busy_spaces, busy_workplaces = await occupied_targets(db, datetime.now(UTC))
    return [serialize_space(space, busy_spaces, busy_workplaces) for space in spaces]


@router.put("/favorites/{space_id}", status_code=status.HTTP_204_NO_CONTENT)
async def add_favorite(
    space_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    if await db.get(Space, space_id) is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Space not found")
    existing = await db.get(Favorite, (current_user.id, space_id))
    if existing is None:
        db.add(Favorite(user_id=current_user.id, space_id=space_id))
        await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.delete("/favorites/{space_id}", status_code=status.HTTP_204_NO_CONTENT)
async def remove_favorite(
    space_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> Response:
    favorite = await db.get(Favorite, (current_user.id, space_id))
    if favorite is not None:
        await db.delete(favorite)
        await db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


def review_options() -> tuple[Load, ...]:
    return (selectinload(Review.user), selectinload(Review.space), selectinload(Review.booking))


def review_collection(reviews: list[Review]) -> ReviewCollection:
    total = len(reviews)

    def average(field: str) -> float | None:
        return round(sum(int(getattr(review, field)) for review in reviews) / total, 1) if total else None

    counts = Counter(review.score for review in reviews)
    return ReviewCollection(
        metrics=ReviewMetrics(
            average=average("score"),
            cleanliness=average("cleanliness"),
            equipment=average("equipment"),
            comfort=average("comfort"),
            total=total,
            distribution={score: counts.get(score, 0) for score in range(1, 6)},
        ),
        items=[serialize_review(review) for review in reviews],
    )


@router.get("/reviews", response_model=ReviewCollection)
async def public_reviews(
    limit: int = Query(default=20, ge=1, le=100),
    space_id: UUID | None = Query(default=None),
    db: AsyncSession = Depends(get_db),
) -> ReviewCollection:
    filters = [Review.is_published.is_(True)]
    if space_id is not None:
        filters.append(Review.space_id == space_id)
    reviews = (
        await db.scalars(
            select(Review)
            .where(*filters)
            .options(*review_options())
            .order_by(Review.created_at.desc())
            .limit(limit)
        )
    ).unique().all()
    return review_collection(list(reviews))


@router.get("/reviews/me", response_model=ReviewCollection)
async def my_reviews(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)) -> ReviewCollection:
    reviews = (
        await db.scalars(
            select(Review)
            .where(Review.user_id == current_user.id)
            .options(*review_options())
            .order_by(Review.created_at.desc())
        )
    ).unique().all()
    return review_collection(list(reviews))


@router.post("/reviews", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    payload: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> ReviewResponse:
    booking = await db.scalar(
        select(Booking)
        .where(Booking.id == payload.booking_id, Booking.user_id == current_user.id)
        .options(*booking_options())
    )
    if booking is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Booking not found")
    if booking.status != "confirmed" or booking.ends_at > datetime.now(UTC):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Only completed bookings can be reviewed")
    if booking.review is not None:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Booking already has a review")
    if booking.space is not None:
        space = booking.space
    elif booking.workplace is not None:
        space = booking.workplace.space
    else:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Booking has no target")
    review = Review(
        user_id=current_user.id,
        space_id=space.id,
        booking_id=booking.id,
        score=payload.score,
        cleanliness=payload.cleanliness,
        equipment=payload.equipment,
        comfort=payload.comfort,
        text=payload.text.strip(),
    )
    db.add(review)
    await db.commit()
    loaded = await db.scalar(select(Review).where(Review.id == review.id).options(*review_options()))
    if loaded is None:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Review could not be loaded")
    return serialize_review(loaded)

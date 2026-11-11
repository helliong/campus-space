from datetime import UTC, datetime, timedelta
from unittest import IsolatedAsyncioTestCase
from uuid import uuid4

from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.api.v1.domain import user_has_overlapping_booking
from app.models.entities import Booking


class UserBookingLimitTests(IsolatedAsyncioTestCase):
    async def test_only_overlapping_active_booking_for_same_user_conflicts(self) -> None:
        engine = create_engine("sqlite://")
        Booking.__table__.create(engine)
        starts_at = datetime(2026, 11, 11, 10, tzinfo=UTC)
        user_id = uuid4()

        with Session(engine) as session:
            session.add_all(
                [
                    self.booking(user_id, starts_at, starts_at + timedelta(minutes=30), "confirmed"),
                    self.booking(user_id, starts_at + timedelta(hours=1), starts_at + timedelta(hours=2), "cancelled"),
                    self.booking(uuid4(), starts_at, starts_at + timedelta(minutes=30), "confirmed"),
                ]
            )
            session.flush()

            class Database:
                async def scalar(self, statement):
                    return session.scalar(statement)

            database = Database()
            self.assertTrue(
                await user_has_overlapping_booking(
                    database,  # type: ignore[arg-type]
                    user_id,
                    starts_at + timedelta(minutes=15),
                    starts_at + timedelta(minutes=45),
                )
            )
            self.assertFalse(
                await user_has_overlapping_booking(
                    database,  # type: ignore[arg-type]
                    user_id,
                    starts_at + timedelta(minutes=30),
                    starts_at + timedelta(minutes=60),
                )
            )

        engine.dispose()

    @staticmethod
    def booking(
        user_id,
        starts_at: datetime,
        ends_at: datetime,
        status: str,
    ) -> Booking:
        return Booking(
            user_id=user_id,
            space_id=uuid4(),
            starts_at=starts_at,
            ends_at=ends_at,
            status=status,
        )

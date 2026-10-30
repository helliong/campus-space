from datetime import UTC, datetime, timedelta
from uuid import uuid4

import unittest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session

from app.api.v1.domain import occupied_targets
from app.models.entities import Booking


class AvailabilityTests(unittest.IsolatedAsyncioTestCase):
    async def test_booking_intervals(self):
        for target in ("workplace", "space"):
            for start, end, status, busy in (
                (-15, 15, "confirmed", True),
                (15, 45, "confirmed", True),
                (0, 30, "pending", True),
                (-30, 0, "confirmed", False),
                (30, 60, "confirmed", False),
                (0, 30, "cancelled", False),
                (0, 30, "rejected", False),
            ):
                with self.subTest(target=target, start=start, end=end, status=status):
                    await self.check_interval(start, end, status, busy, target)

    async def check_interval(self, start, end, status, busy, target):
        engine = create_engine("sqlite://")
        Booking.__table__.create(engine)
        at = datetime(2026, 10, 30, 10, tzinfo=UTC)
        target_id = uuid4()
        with Session(engine) as session:
            session.add(Booking(
                user_id=uuid4(),
                space_id=target_id if target == "space" else None,
                workplace_id=target_id if target == "workplace" else None,
                starts_at=at + timedelta(minutes=start),
                ends_at=at + timedelta(minutes=end),
                status=status,
            ))
            session.flush()
    
            class Database:
                async def scalars(self, statement):
                    return session.scalars(statement)
    
            spaces, workplaces = await occupied_targets(Database(), at, at + timedelta(minutes=30))
            assert spaces == ({target_id} if busy and target == "space" else set())
            assert workplaces == ({target_id} if busy and target == "workplace" else set())
        engine.dispose()

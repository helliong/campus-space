from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from unittest import IsolatedAsyncioTestCase
from uuid import uuid4

from fastapi import HTTPException
from pydantic import ValidationError

from app.api.v1.domain import create_booking
from app.schemas.domain import BookingCreate


class BookingValidationTests(IsolatedAsyncioTestCase):
    async def test_past_booking_is_rejected_before_database_access(self) -> None:
        now = datetime.now(UTC)
        payload = BookingCreate(
            space_id=uuid4(),
            starts_at=now - timedelta(hours=1),
            ends_at=now - timedelta(minutes=30),
        )

        with self.assertRaises(HTTPException) as raised:
            await create_booking(
                payload=payload,
                current_user=SimpleNamespace(id=uuid4()),
                db=None,  # type: ignore[arg-type]
            )

        self.assertEqual(raised.exception.status_code, 409)
        self.assertEqual(raised.exception.detail, "Нельзя забронировать прошедшие дату и время")

    def test_booking_timestamps_require_timezone(self) -> None:
        now = datetime.now().replace(tzinfo=None)

        with self.assertRaises(ValidationError):
            BookingCreate(
                space_id=uuid4(),
                starts_at=now + timedelta(hours=1),
                ends_at=now + timedelta(hours=2),
            )

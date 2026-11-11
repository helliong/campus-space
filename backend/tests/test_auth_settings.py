from datetime import timedelta

import pytest
from pydantic import ValidationError

from app.core.security import create_token, decode_token
from app.schemas.auth import RegisterRequest


def test_registration_accepts_any_valid_email_domain() -> None:
    request = RegisterRequest(
        email=" Student@Example.com ",
        password="password123",
        full_name="Иван Иванов",
    )

    assert request.email == "student@example.com"


def test_registration_rejects_invalid_email() -> None:
    with pytest.raises(ValidationError):
        RegisterRequest(
            email="not-an-email",
            password="password123",
            full_name="Иван Иванов",
        )


def test_session_version_is_preserved_in_token() -> None:
    token, _, _ = create_token("user-id", "access", timedelta(minutes=5), {"ver": 3})

    assert decode_token(token, "access")["ver"] == 3

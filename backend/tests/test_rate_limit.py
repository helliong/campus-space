from starlette.requests import Request

from app.core.rate_limit import login_rate_limit_key


def make_request(ip: str) -> Request:
    return Request({"type": "http", "client": (ip, 12345), "headers": []})


def test_login_rate_limit_key_isolated_by_email() -> None:
    request = make_request("127.0.0.1")

    assert login_rate_limit_key(request, "one@example.com") != login_rate_limit_key(
        request, "two@example.com"
    )


def test_login_rate_limit_key_normalizes_email() -> None:
    request = make_request("127.0.0.1")

    assert login_rate_limit_key(request, " User@Example.com ") == login_rate_limit_key(
        request, "user@example.com"
    )


def test_login_rate_limit_key_isolated_by_ip() -> None:
    assert login_rate_limit_key(
        make_request("127.0.0.1"), "user@example.com"
    ) != login_rate_limit_key(make_request("127.0.0.2"), "user@example.com")

from fastapi import APIRouter

router = APIRouter()


@router.get("")
async def api_healthcheck() -> dict[str, str]:
    return {"status": "ok", "service": "campus-space-api"}


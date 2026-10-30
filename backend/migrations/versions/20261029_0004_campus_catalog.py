"""Seed the permanent campus catalog without user activity data."""

from uuid import UUID, uuid5

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision = "20261029_0004"
down_revision = "20261029_0003"
branch_labels = None
depends_on = None


CATALOG_NAMESPACE = UUID("9e53daca-8988-4ba8-af5b-a73ed9f46cf2")


def catalog_id(value: str) -> UUID:
    return uuid5(CATALOG_NAMESPACE, value)


BUILDING_A_ID = catalog_id("building-a")
FLOOR_IDS = {number: catalog_id(f"building-a-floor-{number}") for number in range(1, 5)}

SPACE_IDS = {
    "a-201": catalog_id("space-a-201"),
    "a-202": catalog_id("space-a-202"),
    "l-203": catalog_id("space-l-203"),
    "k-214": catalog_id("space-k-214"),
    "a-208": catalog_id("space-a-208"),
    "p-2": catalog_id("space-p-2"),
}

AMENITY_IDS = {
    "wifi": catalog_id("amenity-wifi"),
    "projector": catalog_id("amenity-projector"),
    "whiteboard": catalog_id("amenity-whiteboard"),
    "computers": catalog_id("amenity-computers"),
    "display": catalog_id("amenity-display"),
    "video-conference": catalog_id("amenity-video-conference"),
}


def upgrade() -> None:
    buildings = sa.table(
        "buildings",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("code", sa.String()),
        sa.column("name", sa.String()),
        sa.column("address", sa.String()),
    )
    floors = sa.table(
        "floors",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("building_id", postgresql.UUID(as_uuid=True)),
        sa.column("number", sa.Integer()),
    )
    spaces = sa.table(
        "spaces",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("floor_id", postgresql.UUID(as_uuid=True)),
        sa.column("code", sa.String()),
        sa.column("name", sa.String()),
        sa.column("space_type", sa.String()),
        sa.column("capacity", sa.Integer()),
        sa.column("description", sa.Text()),
        sa.column("access_policy", sa.String()),
        sa.column("requires_approval", sa.Boolean()),
        sa.column("map_x", sa.Numeric(8, 2)),
        sa.column("map_y", sa.Numeric(8, 2)),
    )
    amenities = sa.table(
        "amenities",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("code", sa.String()),
        sa.column("name", sa.String()),
    )
    space_amenities = sa.table(
        "space_amenities",
        sa.column("space_id", postgresql.UUID(as_uuid=True)),
        sa.column("amenity_id", postgresql.UUID(as_uuid=True)),
    )
    workplaces = sa.table(
        "workplaces",
        sa.column("id", postgresql.UUID(as_uuid=True)),
        sa.column("space_id", postgresql.UUID(as_uuid=True)),
        sa.column("code", sa.String()),
        sa.column("kind", sa.String()),
        sa.column("has_computer", sa.Boolean()),
        sa.column("is_active", sa.Boolean()),
        sa.column("map_x", sa.Numeric(8, 2)),
        sa.column("map_y", sa.Numeric(8, 2)),
    )

    op.bulk_insert(
        buildings,
        [
            {
                "id": BUILDING_A_ID,
                "code": "A",
                "name": "Учебный корпус А",
                "address": "Главный кампус",
            }
        ],
    )
    op.bulk_insert(
        floors,
        [
            {"id": FLOOR_IDS[number], "building_id": BUILDING_A_ID, "number": number}
            for number in range(1, 5)
        ],
    )
    op.bulk_insert(
        amenities,
        [
            {"id": AMENITY_IDS["wifi"], "code": "wifi", "name": "Wi-Fi"},
            {"id": AMENITY_IDS["projector"], "code": "projector", "name": "Проектор"},
            {"id": AMENITY_IDS["whiteboard"], "code": "whiteboard", "name": "Маркерная доска"},
            {"id": AMENITY_IDS["computers"], "code": "computers", "name": "Компьютеры"},
            {"id": AMENITY_IDS["display"], "code": "display", "name": "Большой экран"},
            {
                "id": AMENITY_IDS["video-conference"],
                "code": "video-conference",
                "name": "Видеоконференция",
            },
        ],
    )
    op.bulk_insert(
        spaces,
        [
            {
                "id": SPACE_IDS["a-201"],
                "floor_id": FLOOR_IDS[2],
                "code": "А-201",
                "name": "Аудитория А-201",
                "space_type": "classroom",
                "capacity": 12,
                "description": "Светлая учебная аудитория для занятий и групповой работы.",
                "access_policy": "public",
                "requires_approval": False,
                "map_x": 12,
                "map_y": 18,
            },
            {
                "id": SPACE_IDS["a-202"],
                "floor_id": FLOOR_IDS[2],
                "code": "А-202",
                "name": "Аудитория А-202",
                "space_type": "classroom",
                "capacity": 12,
                "description": "Аудитория для семинаров, встреч и самостоятельной работы.",
                "access_policy": "public",
                "requires_approval": False,
                "map_x": 36,
                "map_y": 18,
            },
            {
                "id": SPACE_IDS["l-203"],
                "floor_id": FLOOR_IDS[2],
                "code": "Л-203",
                "name": "Лаборатория Л-203",
                "space_type": "laboratory",
                "capacity": 20,
                "description": "Учебная лаборатория с компьютерным оборудованием.",
                "access_policy": "restricted",
                "requires_approval": True,
                "map_x": 62,
                "map_y": 18,
            },
            {
                "id": SPACE_IDS["k-214"],
                "floor_id": FLOOR_IDS[2],
                "code": "К-214",
                "name": "Коворкинг К-214",
                "space_type": "coworking",
                "capacity": 12,
                "description": "Коворкинг с двенадцатью индивидуальными компьютерными местами.",
                "access_policy": "public",
                "requires_approval": False,
                "map_x": 12,
                "map_y": 55,
            },
            {
                "id": SPACE_IDS["a-208"],
                "floor_id": FLOOR_IDS[2],
                "code": "А-208",
                "name": "Аудитория А-208",
                "space_type": "classroom",
                "capacity": 4,
                "description": "Небольшая аудитория для командной работы.",
                "access_policy": "public",
                "requires_approval": False,
                "map_x": 38,
                "map_y": 55,
            },
            {
                "id": SPACE_IDS["p-2"],
                "floor_id": FLOOR_IDS[2],
                "code": "П-2",
                "name": "Переговорная П-2",
                "space_type": "meeting_room",
                "capacity": 6,
                "description": "Переговорная с экраном и оборудованием для видеосвязи.",
                "access_policy": "public",
                "requires_approval": False,
                "map_x": 64,
                "map_y": 55,
            },
        ],
    )

    amenity_map = {
        "a-201": ("wifi", "projector", "whiteboard"),
        "a-202": ("wifi", "whiteboard"),
        "l-203": ("wifi", "projector", "whiteboard", "computers"),
        "k-214": ("wifi", "computers"),
        "a-208": ("wifi", "projector"),
        "p-2": ("wifi", "display", "video-conference"),
    }
    op.bulk_insert(
        space_amenities,
        [
            {"space_id": SPACE_IDS[space_code], "amenity_id": AMENITY_IDS[amenity_code]}
            for space_code, amenity_codes in amenity_map.items()
            for amenity_code in amenity_codes
        ],
    )

    op.bulk_insert(
        workplaces,
        [
            {
                "id": catalog_id(f"workplace-k-214-{number}"),
                "space_id": SPACE_IDS["k-214"],
                "code": f"ПК-{number}",
                "kind": "computer_seat",
                "has_computer": True,
                "is_active": True,
                "map_x": 14 + ((number - 1) % 4) * 22,
                "map_y": 18 + ((number - 1) // 4) * 28,
            }
            for number in range(1, 13)
        ],
    )


def downgrade() -> None:
    op.execute(
        sa.text("DELETE FROM buildings WHERE id = CAST(:building_id AS uuid)").bindparams(
            building_id=str(BUILDING_A_ID)
        )
    )
    op.execute(
        sa.text("DELETE FROM amenities WHERE id = ANY(CAST(:amenity_ids AS uuid[]))").bindparams(
            amenity_ids="{" + ",".join(str(value) for value in AMENITY_IDS.values()) + "}"
        )
    )

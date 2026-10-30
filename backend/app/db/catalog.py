"""Idempotent initialization of the permanent campus catalog."""

from uuid import UUID, uuid5

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.entities import Amenity, Building, Floor, Space, SpaceAmenity, Workplace


CATALOG_NAMESPACE = UUID("9e53daca-8988-4ba8-af5b-a73ed9f46cf2")


def catalog_id(value: str) -> UUID:
    return uuid5(CATALOG_NAMESPACE, value)


SPACE_DEFINITIONS = (
    {
        "key": "a-201",
        "code": "А-201",
        "name": "Аудитория А-201",
        "space_type": "classroom",
        "capacity": 12,
        "description": "Светлая учебная аудитория для занятий и групповой работы.",
        "access_policy": "public",
        "requires_approval": False,
        "map_x": 12,
        "map_y": 18,
        "amenities": ("wifi", "projector", "whiteboard"),
    },
    {
        "key": "a-202",
        "code": "А-202",
        "name": "Аудитория А-202",
        "space_type": "classroom",
        "capacity": 12,
        "description": "Аудитория для семинаров, встреч и самостоятельной работы.",
        "access_policy": "public",
        "requires_approval": False,
        "map_x": 36,
        "map_y": 18,
        "amenities": ("wifi", "whiteboard"),
    },
    {
        "key": "l-203",
        "code": "Л-203",
        "name": "Лаборатория Л-203",
        "space_type": "laboratory",
        "capacity": 20,
        "description": "Учебная лаборатория с компьютерным оборудованием.",
        "access_policy": "restricted",
        "requires_approval": True,
        "map_x": 62,
        "map_y": 18,
        "amenities": ("wifi", "projector", "whiteboard", "computers"),
    },
    {
        "key": "k-214",
        "code": "К-214",
        "name": "Коворкинг К-214",
        "space_type": "coworking",
        "capacity": 12,
        "description": "Коворкинг с двенадцатью индивидуальными компьютерными местами.",
        "access_policy": "public",
        "requires_approval": False,
        "map_x": 12,
        "map_y": 55,
        "amenities": ("wifi", "computers"),
    },
    {
        "key": "a-208",
        "code": "А-208",
        "name": "Аудитория А-208",
        "space_type": "classroom",
        "capacity": 4,
        "description": "Небольшая аудитория для командной работы.",
        "access_policy": "public",
        "requires_approval": False,
        "map_x": 38,
        "map_y": 55,
        "amenities": ("wifi", "projector"),
    },
    {
        "key": "p-2",
        "code": "П-2",
        "name": "Переговорная П-2",
        "space_type": "meeting_room",
        "capacity": 6,
        "description": "Переговорная с экраном и оборудованием для видеосвязи.",
        "access_policy": "public",
        "requires_approval": False,
        "map_x": 64,
        "map_y": 55,
        "amenities": ("wifi", "display", "video-conference"),
    },
)


async def ensure_campus_catalog(db: AsyncSession) -> None:
    """Create or repair reference catalog entries without touching user data."""

    building = await db.scalar(select(Building).where(Building.code == "A"))
    if building is None:
        building = Building(
            id=catalog_id("building-a"),
            code="A",
            name="Учебный корпус А",
            address="Главный кампус",
        )
        db.add(building)
    else:
        building.name = "Учебный корпус А"
        building.address = "Главный кампус"
    await db.flush()

    floor_by_number: dict[int, Floor] = {}
    for number in range(1, 5):
        floor = await db.scalar(
            select(Floor).where(Floor.building_id == building.id, Floor.number == number)
        )
        if floor is None:
            floor = Floor(
                id=catalog_id(f"building-a-floor-{number}"),
                building_id=building.id,
                number=number,
            )
            db.add(floor)
        floor_by_number[number] = floor
    await db.flush()

    amenity_names = {
        "wifi": "Wi-Fi",
        "projector": "Проектор",
        "whiteboard": "Маркерная доска",
        "computers": "Компьютеры",
        "display": "Большой экран",
        "video-conference": "Видеоконференция",
    }
    amenity_by_code: dict[str, Amenity] = {}
    for code, name in amenity_names.items():
        amenity = await db.scalar(select(Amenity).where(Amenity.code == code))
        if amenity is None:
            amenity = Amenity(id=catalog_id(f"amenity-{code}"), code=code, name=name)
            db.add(amenity)
        else:
            amenity.name = name
        amenity_by_code[code] = amenity
    await db.flush()

    space_by_key: dict[str, Space] = {}
    second_floor = floor_by_number[2]
    for definition in SPACE_DEFINITIONS:
        space = await db.scalar(
            select(Space).where(
                Space.floor_id == second_floor.id,
                Space.code == definition["code"],
            )
        )
        values = {
            key: definition[key]
            for key in (
                "name",
                "space_type",
                "capacity",
                "description",
                "access_policy",
                "requires_approval",
                "map_x",
                "map_y",
            )
        }
        if space is None:
            space = Space(
                id=catalog_id(f"space-{definition['key']}"),
                floor_id=second_floor.id,
                code=str(definition["code"]),
                **values,
            )
            db.add(space)
        else:
            for key, value in values.items():
                setattr(space, key, value)
        space_by_key[str(definition["key"])] = space
    await db.flush()

    for definition in SPACE_DEFINITIONS:
        space = space_by_key[str(definition["key"])]
        for amenity_code in definition["amenities"]:
            amenity = amenity_by_code[str(amenity_code)]
            link = await db.get(SpaceAmenity, (space.id, amenity.id))
            if link is None:
                db.add(SpaceAmenity(space_id=space.id, amenity_id=amenity.id))

    coworking = space_by_key["k-214"]
    for number in range(1, 13):
        code = f"ПК-{number}"
        workplace = await db.scalar(
            select(Workplace).where(Workplace.space_id == coworking.id, Workplace.code == code)
        )
        values = {
            "kind": "computer_seat",
            "has_computer": True,
            "is_active": True,
            "map_x": 14 + ((number - 1) % 4) * 22,
            "map_y": 18 + ((number - 1) // 4) * 28,
        }
        if workplace is None:
            db.add(
                Workplace(
                    id=catalog_id(f"workplace-k-214-{number}"),
                    space_id=coworking.id,
                    code=code,
                    **values,
                )
            )
        else:
            for key, value in values.items():
                setattr(workplace, key, value)

    await db.commit()

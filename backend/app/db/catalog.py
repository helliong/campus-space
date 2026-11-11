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
        "image_url": "/images/spaces/a-101.jpg",
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
        "image_url": "/images/spaces/a-101.jpg",
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
        "image_url": "/images/spaces/l-305.jpg",
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
        "image_url": "/images/spaces/k-104.jpg",
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
        "image_url": "/images/spaces/a-101.jpg",
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
        "image_url": "/images/spaces/p-1.jpg",
        "amenities": ("wifi", "display", "video-conference"),
    },
    {
        "key": 'a-101',
        "code": 'А-101',
        "name": 'Аудитория А-101',
        "space_type": 'classroom',
        "capacity": 12,
        "floor": 1,
        "description": 'Аудитория для лекций и семинаров.',
        "access_policy": 'public',
        "requires_approval": False,
        "map_x": 55,
        "map_y": 6,
        "image_url": "/images/spaces/a-101.jpg",
        "amenities": ('wifi', 'projector', 'whiteboard'),
    },
    {
        "key": 'k-104',
        "code": 'К-104',
        "name": 'Коворкинг К-104',
        "space_type": 'coworking',
        "capacity": 12,
        "floor": 1,
        "description": 'Открытый коворкинг рядом с главным холлом.',
        "access_policy": 'public',
        "requires_approval": False,
        "map_x": 5,
        "map_y": 6,
        "image_url": "/images/spaces/k-104.jpg",
        "amenities": ('wifi', 'computers'),
    },
    {
        "key": 'p-1',
        "code": 'П-1',
        "name": 'Переговорная П-1',
        "space_type": 'meeting_room',
        "capacity": 6,
        "floor": 1,
        "description": 'Комната для встреч и командных обсуждений.',
        "access_policy": 'public',
        "requires_approval": False,
        "map_x": 5,
        "map_y": 60,
        "image_url": "/images/spaces/p-1.jpg",
        "amenities": ('wifi', 'projector', 'whiteboard'),
    },
    {
        "key": 'a-108',
        "code": 'А-108',
        "name": 'Аудитория А-108',
        "space_type": 'classroom',
        "capacity": 12,
        "floor": 1,
        "description": 'Тихая аудитория для самостоятельной работы.',
        "access_policy": 'public',
        "requires_approval": False,
        "map_x": 55,
        "map_y": 60,
        "image_url": "/images/spaces/a-101.jpg",
        "amenities": ('wifi', 'projector', 'whiteboard'),
    },
    {
        "key": 'k-304',
        "code": 'К-304',
        "name": 'Коворкинг К-304',
        "space_type": 'coworking',
        "capacity": 12,
        "floor": 3,
        "description": 'Компьютерные места для работы над проектами.',
        "access_policy": 'public',
        "requires_approval": False,
        "map_x": 3,
        "map_y": 6,
        "image_url": "/images/spaces/k-104.jpg",
        "amenities": ('wifi', 'computers'),
    },
    {
        "key": 'l-305',
        "code": 'Л-305',
        "name": 'Лаборатория Л-305',
        "space_type": 'laboratory',
        "capacity": 12,
        "floor": 3,
        "description": 'Проектная лаборатория с доступом по заявке.',
        "access_policy": 'restricted',
        "requires_approval": True,
        "map_x": 3,
        "map_y": 57,
        "image_url": "/images/spaces/l-305.jpg",
        "amenities": ('wifi', 'projector', 'whiteboard'),
    },
    {
        "key": 'a-301',
        "code": 'А-301',
        "name": 'Аудитория А-301',
        "space_type": 'classroom',
        "capacity": 12,
        "floor": 3,
        "description": 'Учебная аудитория в восточном крыле.',
        "access_policy": 'public',
        "requires_approval": False,
        "map_x": 59,
        "map_y": 6,
        "image_url": "/images/spaces/a-101.jpg",
        "amenities": ('wifi', 'projector', 'whiteboard'),
    },
    {
        "key": 'a-308',
        "code": 'А-308',
        "name": 'Аудитория А-308',
        "space_type": 'classroom',
        "capacity": 12,
        "floor": 3,
        "description": 'Аудитория для практических занятий.',
        "access_policy": 'public',
        "requires_approval": False,
        "map_x": 59,
        "map_y": 57,
        "image_url": "/images/spaces/a-101.jpg",
        "amenities": ('wifi', 'projector', 'whiteboard'),
    },

)


async def ensure_campus_catalog(db: AsyncSession) -> None:
    """Create or repair reference catalog entries without touching user data."""

    building = await db.scalar(select(Building).where(Building.code == "A"))
    if building is None:
        building = Building(
            id=catalog_id("building-a"),
            code="A",
            name="Главный учебный корпус",
            address="Университетский проспект, 1",
        )
        db.add(building)
        await db.flush()

    floors = (
        (1, "1 этаж", "Коворкинг, переговорные и учебные аудитории первого этажа"),
        (2, "2 этаж", "Аудитории, лаборатории и коворкинг второго этажа"),
        (3, "3 этаж", "Проектные лаборатории и специализированные аудитории"),
    )
    floor_by_number: dict[int, Floor] = {}
    for number, title, description in floors:
        floor = await db.scalar(
            select(Floor).where(Floor.building_id == building.id, Floor.number == number)
        )
        if floor is None:
            floor = Floor(
                id=catalog_id(f"floor-a-{number}"),
                building_id=building.id,
                number=number,
                title=title,
                description=description,
            )
            db.add(floor)
            await db.flush()
        floor_by_number[number] = floor

    amenity_names = {
        "wifi": "Wi-Fi",
        "projector": "Проектор",
        "whiteboard": "Маркерная доска",
        "computers": "Компьютеры",
        "display": "ТВ-панель",
        "video-conference": "Видеоконференцсвязь",
    }
    amenity_by_code: dict[str, Amenity] = {}
    for code, name in amenity_names.items():
        amenity = await db.scalar(select(Amenity).where(Amenity.code == code))
        if amenity is None:
            amenity = Amenity(id=catalog_id(f"amenity-{code}"), code=code, name=name)
            db.add(amenity)
            await db.flush()
        else:
            amenity.name = name
        amenity_by_code[code] = amenity
    await db.flush()

    space_by_key: dict[str, Space] = {}
    for definition in SPACE_DEFINITIONS:
        floor = floor_by_number[definition.get("floor", 2)]
        space = await db.scalar(
            select(Space).where(
                Space.floor_id == floor.id,
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
        if "image_url" in definition:
            values["image_url"] = definition["image_url"]

        if space is None:
            space = Space(
                id=catalog_id(f"space-{definition['key']}"),
                floor_id=floor.id,
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

    for definition in SPACE_DEFINITIONS:
        if definition["space_type"] != "coworking":
            continue
        coworking = space_by_key[str(definition["key"])]
        for number in range(1, int(definition["capacity"]) + 1):
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
                        id=catalog_id(f"workplace-{definition['key']}-{number}"),
                        space_id=coworking.id,
                        code=code,
                        **values,
                    )
                )
            else:
                for key, value in values.items():
                    setattr(workplace, key, value)

    await db.commit()

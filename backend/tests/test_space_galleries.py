from pathlib import Path

from app.db.catalog import SPACE_DEFINITIONS


SPACE_IMAGE_ROOT = (
    Path(__file__).resolve().parents[2] / "frontend" / "public" / "images" / "spaces"
)


def test_every_space_has_three_unique_gallery_images() -> None:
    for definition in SPACE_DEFINITIONS:
        images = tuple(definition["images"])

        assert len(images) == 3, definition["code"]
        assert len(set(images)) == 3, definition["code"]

        for image_url in images:
            assert image_url.startswith("/images/spaces/"), image_url
            assert (SPACE_IMAGE_ROOT / Path(image_url).name).is_file(), image_url

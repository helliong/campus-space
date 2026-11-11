from io import BytesIO
from unittest import TestCase

from fastapi import HTTPException
from PIL import Image

from app.api.v1.auth import AVATAR_DIMENSION, avatar_to_webp


class AvatarProcessingTests(TestCase):
    def test_image_is_center_cropped_and_converted_to_webp(self) -> None:
        source = BytesIO()
        Image.new("RGB", (1200, 800), color=(51, 70, 200)).save(source, format="PNG")

        result = avatar_to_webp(source.getvalue())

        with Image.open(BytesIO(result)) as image:
            self.assertEqual(image.format, "WEBP")
            self.assertEqual(image.size, (AVATAR_DIMENSION, AVATAR_DIMENSION))

    def test_invalid_image_is_rejected(self) -> None:
        with self.assertRaises(HTTPException) as raised:
            avatar_to_webp(b"not an image")

        self.assertEqual(raised.exception.status_code, 422)

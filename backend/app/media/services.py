from io import BytesIO
from PIL import Image
import mimetypes
from functools import lru_cache
from zipfile import ZipFile
from typing import Tuple
from pathlib import Path

from fastapi import HTTPException

from app.common.files import is_supported_image, is_supported_archive
from app.core.config import settings
from app.core.globals import logger

@lru_cache(maxsize=256)
def _read_zip_image(zip_path: str, img: str, _mtime: float) -> bytes:
    with ZipFile(zip_path, 'r') as zf:
        if img not in zf.namelist():
            raise KeyError(img)
        return zf.read(img)

def get_image_from_container(img, target) -> Tuple[bytes, str]:
    logger.info(
        f"retrieving image: `{str(img)}` from container `{target}`"
    )

    # get mime type
    mime_type, _ = mimetypes.guess_type(img)
    if mime_type is None:
        mime_type = "image/jpeg"

    if is_supported_archive(target):
        try:
            image_data = _read_zip_image(
                str(target), 
                img, 
                target.stat().st_mtime
            )
        except KeyError:
            raise HTTPException(
                status_code=404, 
                detail='Image not in archive'
            )
    
    # target = target / img
    elif is_supported_image(target / img):
        with open(target / img, 'rb') as f:
            image_data = f.read()
    else:
        msg = (
            f'Unsupported container-image pair: '
            f'{str(target.relative_to(settings.BROWSER_ROOT))}:{img}'
        )
        logger.error(msg)
        raise ValueError(msg)

    return image_data, mime_type

def _make_thumbnail(image_data: bytes, max_dim) -> bytes:
    """
    downscales an image into a thumbnail
    """
    img = Image.open(BytesIO(image_data))
    img = img.convert("RGB")  # drops alpha, normalizes mode (P, L, RGBA, etc.) to something JPEG can save
    img.thumbnail(
        (max_dim, max_dim), 
        Image.LANCZOS
    )  # resizes in-place, preserves aspect ratio, no upscaling
    buffer = BytesIO()
    img.save(buffer, format="JPEG", quality=80, optimize=True)
    return buffer.getvalue()

def _thumbnail_cache_path(target, img, max_dim) -> Path:
    return (
        settings.CACHE_DIR 
        / f"thumbnails/{target.relative_to(settings.BROWSER_ROOT)}/"
        / f"{img}_x{max_dim}.jpg"
    )


def _get_cached_thumbnail(target, img, max_dim) -> bytes | None:
    path = _thumbnail_cache_path(target, img, max_dim)
    if path.exists() and path.stat().st_mtime >= target.stat().st_mtime:
        return path.read_bytes()
    return None

def _write_thumbnail_to_cache(img, target, max_dim, data: bytes) -> Tuple[bytes, str]:
    path = _thumbnail_cache_path(target, img, max_dim)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(data)


def get_thumbnail_from_container(img, target, max_dim) -> Tuple[bytes, str]:

    logger.info(f"fetching thumbnail for `{img}`")
    # attempt to retrieve from cache
    cached = _get_cached_thumbnail(target, img, max_dim)
    if cached is not None:
        return cached, 'image/jpeg'

    # retrieve image, downscale, and add to cache
    content, _ = get_image_from_container(img, target)
    thumbnail = _make_thumbnail(content, max_dim)
    _write_thumbnail_to_cache(img, target, max_dim, thumbnail)

    return thumbnail, 'image/jpeg'


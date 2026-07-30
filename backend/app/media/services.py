from io import BytesIO
import mimetypes
from functools import lru_cache
from zipfile import ZipFile
from typing import Tuple

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

def get_image_from_container(img, target) -> Tuple[BytesIO, str]:

    if is_supported_archive(target):
        try:
            image_data = _read_zip_image(str(target), img, target.stat().st_mtime)
        except KeyError:
            raise HTTPException(status_code=404, detail='Image not in archive')
        mime_type, _ = mimetypes.guess_type(img)
        if mime_type is None:
            mime_type = "image/jpeg"
        return BytesIO(image_data), mime_type
    
    target = target / img
    if is_supported_image(target):
        with open(target, 'rb') as f:
            image_data = f.read()
            buffer = BytesIO(image_data)
            mime_type, _ = mimetypes.guess_type(img)
            if mime_type is None:
                mime_type = "image/jpeg"
            return buffer, mime_type

    msg = (
        f'Unsupported container-image pair: '
        f'{str(target.relative_to(settings.BROWSER_ROOT))}:{img}'
    )
    logger.error(msg)
    raise ValueError(msg)
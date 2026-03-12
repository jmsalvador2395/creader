from io import BytesIO
import mimetypes
from zipfile import ZipFile
from typing import Tuple

from app.common.files import is_supported_image, is_supported_archive
from app.core.config import settings
from app.core.globals import logger

def get_image_from_container(img, target) -> Tuple[BytesIO, str]:

    if is_supported_archive(target):
        with ZipFile(target, 'r') as zf:
            files = list(filter(
                lambda x: is_supported_image(x),
                zf.namelist()
            ))
            if img not in files:
                raise HTTPException(
                    status_code=404, 
                    detail='Image not in archive'
                )

            image_data = zf.read(img)
            buffer = BytesIO(image_data)
            mime_type, _ = mimetypes.guess_type(img)
            return buffer, mime_type
    
    target = target / img
    if is_supported_image(target) and target.exists():
        with open(target, 'rb') as f:
            image_data = f.read()
            buffer = BytesIO(image_data)
            mime_type, _ = mimetypes.guess_type(img)
            return buffer, mime_type

    msg = (
        f'Unsupported container-image pair: '
        f'{str(target.relative_to(settings.BROWSER_ROOT))}:{img}'
    )
    logger.error(msg)
    raise ValueError(msg)
from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response, FileResponse, StreamingResponse
from app.core.config import settings
from app.files.metadata import (
    get_mime_type, is_supported_image, is_supported_archive,
)

from io import BytesIO
from pathlib import Path
from zipfile import ZipFile
import mimetypes

api_router = APIRouter(prefix='/media', tags=['media'])
        
@api_router.get('/container-image')
async def container_image(
    c: Path=Query(...), 
    img: Path=Query(None),
):
    """returns an image from standard image types or zip files
    """

    img = str(img)

    target = settings.BROWSER_ROOT / c

    if is_supported_archive(target):
        try:
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
                return StreamingResponse(buffer, media_type=mime_type)
        except Exception as e:
            raise HTTPException(
                status_code=404, 
                detail='Image not found'
            )
    
    target = target / img
    if is_supported_image(target):
        if not target.exists():
            raise HTTPException(
                status_code=404, 
                detail='Image not found'
            )

        with open(target, 'rb') as f:
            try:
                image_data = f.read()
                buffer = BytesIO(image_data)
                mime_type, _ = mimetypes.guess_type(img)
                return StreamingResponse(buffer, media_type=mime_type)
            except FileNotFoundError:
                raise HTTPException(
                    status_code=404, 
                    detail="File not found"
                )
            except PermissionError:
                raise HTTPException(
                    status_code=403, 
                    detail="Permission denied"
                )
            except OSError as e:
                raise HTTPException(
                    status_code=500, 
                    detail=f"Server error: {str(e)}"
                )
    raise HTTPException(
        status_code=415,
        detail=f'Unsupported container-image pair: {str(c)}:{str(img)}'
    )

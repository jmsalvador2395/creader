from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import Response, FileResponse, StreamingResponse
from app.api.routes import auth, directory
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
def container_image(
    c: Path=Query(...), 
    img: str=Query(None),
):
    """returns an image from standard image types or zip files
    """

    target = settings.BROWSER_ROOT / c

    if is_supported_archive(target):
        try:
            with ZipFile(target, 'r') as zf:
                if img not in zf.namelist():
                    raise HTTPException(
                        status_code=404, 
                        detail='Image not in archive'
                    )

                image_data = zf.read(img)
                buffer = BytesIO(image_data)
                mime_type, _ = mimetypes.guess_type(img)
                print('got mimetype')
                return StreamingResponse(
                    buffer, 
                    media_type=mime_type or 'application/octet-stream'
                )
        except Exception as e:
            raise HTTPException(
                status_code=404, 
                detail='Image not found'
            )
    
    elif is_supported_image(target):
        if not os.path.exists(target):
            raise HTTPException(
                status_code=404, 
                detail='Image not found'
            )

        with open(target, 'rb') as f:
            image_data = f.read()
        mime_type = get_mime_type(target)
        return HttpResponse(
            image_data, 
            content_type=mime_type
        )


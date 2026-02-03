from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import (Response, FileResponse)
from app.api.routes import auth, directory
from app.core.config import settings
from app.core.utils import (
    get_mime_type, is_supported_image, is_supported_archive,
)

from pathlib import Path
from zipfile import ZipFile

api_router = APIRouter(prefix='/media', tags=['media'])


        
@api_router.get('/image_get')
def image_get(
    p: Path=Query(...), 
    img_name: Path=None
):
    """returns an image from standard image types or zip files
    """

    target = MEDIA_ROOT / p

    if is_supported_archive(target):
        try:
            with ZipFile(target, 'r') as zf:
                if img_name not in zf.namelist():
                    raise HTTPException(
                        status_code=404, 
                        detail='Image not in archive'
                    )

                image_data = zf.read(img_name)
                mime_type, _ = mimetypes.guess_type(img_name)
                return HttpResponse(
                    image_data, 
                    content_type=mime_type or 'application/octet-stream'
                )
        except Exception as e:
            raise Http404(f"Error retrieving image: {e}")
    
    elif is_supported_image(target):
        if not os.path.exists(target):
            raise HTTPException(status_code=404, detail='Image not found')

        with open(target, 'rb') as f:
            image_data = f.read()
        mime_type = get_mime_type(target)
        return HttpResponse(
            image_data, 
            content_type=mime_type
        )


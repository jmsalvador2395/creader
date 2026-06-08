from fastapi import APIRouter, HTTPException, Query 
from fastapi.responses import StreamingResponse
from zipfile import BadZipFile

from app.core.config import settings

from .services import get_image_from_container

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
    try:
        buffer, mime_type = get_image_from_container(img, target)
        headers = {
            'Cache-Control': 'public, max-age=86400',
        }
        return StreamingResponse(
            buffer, 
            media_type=mime_type,
            headers=headers,
        )
    except BadZipFile:
        raise HTTPException(
            status_code=422,
            details=f"Failed to open file `{img}` from container `{str(c)}`"
        )
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
    except ValueError as e:
        raise HTTPException(
            status_code=415,
            details=f"Unsupported: {str(e)}"
        )
    except Exception as e:
        raise HTTPException(
            status_code=400, 
            detail=f"Not sure what happened but here's the stack trace: {str(e)}"
        )
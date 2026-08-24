from fastapi import APIRouter, HTTPException, Query 
from fastapi.responses import Response
from zipfile import BadZipFile
from io import BytesIO
from pathlib import Path
from zipfile import ZipFile
import mimetypes

from app.core.config import settings
from app.core.globals import logger

from .services import (
    get_image_from_container, 
    get_thumbnail_from_container
)

api_router = APIRouter(prefix='/media', tags=['media'])
        
@api_router.get('/container-image', name='media:container-image')
async def container_image(
    c: Path=Query(...), 
    img: str=Query(None),
):
    """returns an image from standard image types or zip files
    """

    target = settings.BROWSER_ROOT / c
    # buffer, mime_type = get_image_from_container(img, target)
    content, mime_type = get_image_from_container(img, target)
    return Response(
        content=content, 
        media_type=mime_type,
        headers={
            'Cache-Control': 'public, max-age=86400',
        }
    )
    
        
@api_router.get('/container-thumbnail', name='media:container-thumbnail')
async def container_thumbnail(
    c: Path=Query(...), 
    img: str=Query(None),
    max_dim: int=Query(512),
):
    """returns a thumbnail from standard image types or zip files
    """

    logger.info('reached container-thumbnail endpoint')

    target = settings.BROWSER_ROOT / c
    content, mime_type = get_thumbnail_from_container(
        img, target, max_dim
    )
    return Response(
        content=content, 
        media_type=mime_type,
        headers={
            'Cache-Control': 'public, max-age=86400',
        }
    )
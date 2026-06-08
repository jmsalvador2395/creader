from fastapi import APIRouter, HTTPException, Query, Depends
from fastapi.responses import StreamingResponse
from zipfile import BadZipFile

from app.core.config import settings

from app.core.globals import logger
from app.common.models.user import User
from app.media.services import get_image_from_container
from app.auth.user_mgmt import current_active_user

from io import BytesIO
from pathlib import Path
from zipfile import ZipFile

api_router = APIRouter(prefix='/remote-fs', tags=['remote-fs'])

@api_router.get()
async def list_connections(
    # session: AsyncSession = Depends(get_async_session),
    user: User = Depends(current_active_user),
):
    """lists the connections associated with the user and their statuses

    Input:


    Returns:
        a list of connection names and their active statuses
    """
    logger.info(f"User `{user.username} requested connection list")

    uid = user.id
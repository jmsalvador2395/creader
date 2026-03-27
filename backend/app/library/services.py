from fastapi import APIRouter, Depends, HTTPException, UploadFile, Query
from pydantic import BaseModel
from pathlib import Path
from sqlalchemy import delete, and_, select, or_
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from urllib.parse import unquote

from app.auth.user_mgmt import current_active_user
from app.common.models.user import User
from app.core import config
from app.core.db.session import get_async_session
from app.core.globals import logger

from .models import Group, Gallery, GroupChild, GroupMember

from app.core.config import settings

async def add_gallery_to_db(
    path: Path,
    user: User,
    session: AsyncSession,
    nickname: Path = None,
):
    logger.log(20, f"adding gallery `{path}` to db")
    full_path = settings.BROWSER_ROOT / path
    if not full_path.exists():
        logger.log(20, f"got invalid path: {str(path)}")
        raise HTTPException(status_code=404, detail='Invalid Path')
    gallery = Gallery(path=str(path),nickname=nickname) 

    session.add(gallery)

    try:
        await session.commit()
    except IntegrityError as e:
        await session.rollback()
        raise HTTPException(
            status_code=409, 
            detail="Gallery already exists"
        )
    
async def check_gallery_in_db(
    path: Path,
    user: User,
    session: AsyncSession,
    nickname: str = None,
):
    logger.log(20, f"checking if `{str(path)}` is a registered gallery")
    result = await session.scalar(
        select(Gallery).where(and_(
            Gallery.path==str(path),
        ))
    )

    return result is not None
   
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

from .models import Group, Gallery, GroupChild, GroupMember, Bookmark

from app.core.config import settings

async def check_bookmark_in_db(
    session: AsyncSession,
    user: User,
    path: str | None, 
    page: str | None,
):

    # build conditions
    logger.log(
        20, 
        (f"User `{user.id}` is checking "
         f"if{f" page {page} of " if page else ""}`"
         f"{path}` is in bookmarks")
    )
    conditions = [Bookmark.user_id==user.id]
    if path:
        conditions.append(Bookmark.path==path)
    if page:
        conditions.append(Bookmark.page==page)

    result = await session.execute(
        select(Bookmark.path, Bookmark.page).where(and_(*conditions))
    )
    return result.mappings().all()

async def add_bookmark_to_db(
    session: AsyncSession,
    user: User,
    path: Path, 
    page: str,
):
    logger.log(20, f"adding `{str(path)}` to bookmarks")

    # check if path exists
    full_path = settings.BROWSER_ROOT / path
    if not full_path.exists():
        logger.log(20, f"got invalid path: {str(path)}")
        raise HTTPException(status_code=404, detail='Invalid Path')

    # make sure gallery exists
    gallery_exists = await check_gallery_in_db(path, user, session)
    if not gallery_exists:
        await add_gallery_to_db(path, user, session)

    # add to bookmarks 
    new_bookmark = Bookmark(
        user_id=user.id,
        path=str(path),
        page=page,
    )
    await session.merge(new_bookmark)
    await session.commit()

async def delete_bookmark_from_db(
    session: AsyncSession,
    user: User,
    path: str,
    page: str,
):
    query = delete(Bookmark).where(and_(
        Bookmark.user_id==user.id,
        Bookmark.path==path,
        Bookmark.page==page,
    ))

    result = await session.execute(query)
    if result.rowcount == 0:
        raise HTTPException(
            status_code=404, 
            detail=f"bookmark`{path}` was not found in favorites"
        )
    else:
        await session.commit()

async def check_favorite_in_db(
    session: AsyncSession,
    user: User,
    path: str | None = None, 
):

    # build conditions
    logger.log(20, f"user `{user.id}` is querying favorites")
    fav_group = await get_fav_group(session, user)
    conditions = [
        GroupMember.group_id==fav_group.id,
        GroupMember.user_id==user.id,
    ]
    if path:
        conditions.append(GroupMember.path==path)

    result = await session.execute(
        select(
            GroupMember.path, 
            GroupMember.date_added
        ).where(and_(*conditions))
    )
    return result.mappings().all()

async def get_fav_group(session, user):
    fav_group = await session.scalar(
        select(Group).where(and_(
            Group.user_id==user.id, 
            Group.name=="Favorites"
        ))
    )
    if not fav_group:
        logger.log(20, f"favorites group for user: {user.id} not found")
        raise HTTPException(status_code=404, detail="Favorites group not found")
    return fav_group


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
   
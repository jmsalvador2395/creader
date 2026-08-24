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

from .models import (
    Group, Gallery, GroupChild, GroupMember, Bookmark, Tag, TagList,
    Author, GalleryAuthor,
)
from .schemas import GalleryInfo

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
    gallery_exists = await check_gallery_in_db(user, session, path)
    if not gallery_exists:
        await add_gallery_to_db(user, session, path)

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
    user: User,
    session: AsyncSession,
    path: Path,
    title: str = None,
):
    logger.log(20, f"adding gallery `{str(path)}` to db")
    full_path = settings.BROWSER_ROOT / path
    if not full_path.exists():
        logger.log(20, f"got invalid path: {str(path)}")
        raise HTTPException(status_code=404, detail='Invalid Path')

    # perform insertion
    gallery = Gallery(
        path=str(path), 
        title=title or str(path),
    ) 
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
    user: User,
    session: AsyncSession,
    path: Path,
):
    logger.log(20, f"checking if `{str(path)}` is a registered gallery")
    result = await session.scalar(
        select(Gallery).where(and_(
            Gallery.path==str(path),
        ))
    )

    return result is not None
   
async def get_gallery_info(
    user: User,
    session: AsyncSession,
    path: str,
) -> GalleryInfo:

    logger.info(f"fetching info for path=`{path}`")
    result = await session.execute(
        select(
            Gallery.title,
            Gallery.date_added,
            Gallery.times_accessed,
            Gallery.last_accessed,
            Author.name.label('author'),
        )
        .select_from(Gallery)
        .join(
            GalleryAuthor, 
            Gallery.path == GalleryAuthor.gallery_path,
            isouter=True,
        )
        .join(
            Author, 
            Author.id == GalleryAuthor.author_id,
            isouter=True,
        )
        .where(
            Gallery.path == path
        )
    )
    base_info = result.all()
    if len(base_info) > 1:
        msg = 'found multiple records for path. should only be 1'
        logger.error(msg)
        raise HTTPException(status_code=500, detail=msg)
    elif len(base_info) == 0 or base_info is None:
        msg = f"gallery for path=`{path}` does not exist"
        logger.error(msg)
        raise HTTPException(status_code=400, detail=msg)
    else:
        base_info = base_info[0]
    tags = await session.scalars(
        select(TagList.name)
        .select_from(Tag)
        .join(TagList, Tag.tag_id == TagList.id)
        .where(
            Tag.path == path
        )
    )
    bookmarks = await session.scalars(
        select(Bookmark.page).
        where(and_(
            Bookmark.user_id == user.id,
            Bookmark.path == path,
        ))
    )
    groups = await session.execute(
        select(
            Group.name,
            Group.date_created,
            GroupMember.date_added
        )
        .select_from(Group)
        .join(GroupMember, and_(
            Group.id == GroupMember.group_id,
            Group.user_id == GroupMember.user_id,
        ))
        .where(and_(
            Group.user_id == user.id,
            GroupMember.path == path,
        ))
    )

    return {
        "path": path,
        "title": base_info.title,
        "author": base_info.author,
        "date_added": base_info.date_added,
        "times_accessed": base_info.times_accessed,
        "last_accessed": base_info.last_accessed,
        "tags": tags.all(),
        "bookmarks": bookmarks.all(),
        "groups": groups.all(),
    }

async def get_tags_for(
    user: User,
    session: AsyncSession,
    path: str,
):
    res = (
        await session.execute(
            select(
                TagList.id,
                TagList.name,
            )
            .select_from(Tag)
            .join(TagList, Tag.tag_id == TagList.id)
            .where(
                Tag.path == path
            )
        )
    )

    return res.mappings().all()
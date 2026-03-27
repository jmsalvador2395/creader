from fastapi import APIRouter, Depends, HTTPException, UploadFile, Query
from fastapi.security import OAuth2PasswordBearer
from pydantic import BaseModel
from pathlib import Path
from sqlalchemy import delete, and_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession
from urllib.parse import unquote

from app.auth.user_mgmt import current_active_user
from app.common.models.user import User
from app.core import config
from app.core.db.session import get_async_session
from app.core.globals import logger

from .models import Group, Gallery, GroupChild, GroupMember
from . import services

settings = config.settings
api_router = APIRouter(prefix='/library', tags=['library'])

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

@api_router.get('/favorite')
async def check_favorite(
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
    path: str = Query(...), 
):
    logger.log(20, f"checking if `%s` is in favorites", str(path))
    fav_group = await get_fav_group(session, user)
    result = await session.scalar(
        select(GroupMember).where(and_(
            GroupMember.group_id==fav_group.id,
            GroupMember.user_id==user.id,
            GroupMember.path==path,
        ))
    )
    return {
        "exists": result is not None,
    }

@api_router.post('/favorite')
async def add_favorite(
    path: Path = Query(...), 
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    logger.log(20, f"adding `{str(path)}` to favorites")

    # check if path exists
    full_path = settings.BROWSER_ROOT / path
    if not full_path.exists():
        logger.log(20, f"got invalid path: {str(path)}")
        raise HTTPException(status_code=404, detail='Invalid Path')

    # make sure gallery exists
    gallery_exists = await services.check_gallery_in_db(path, user, session)
    if not gallery_exists:
        await services.add_gallery_to_db(path, user, session)

    # add to favorites
    fav_group = await get_fav_group(session, user)
    new_favorite = GroupMember(
        user_id=user.id,
        group_id=fav_group.id,
        path=str(path),
    )
    session.add(new_favorite)
    try:
        await session.commit()
    except IntegrityError as e:
        logger.log(20, f"failed to add favorite, got:\n{str(e)}")
        await session.rollback()
        raise HTTPException(
            status_code=409, 
            detail="Favorite already exists"
        )


@api_router.delete('/favorite')
async def delete_favorite(
    path: str = Query(...), 
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    fav_group = await get_fav_group(session, user)

    query = delete(GroupMember).where(and_(
        GroupMember.group_id==fav_group.id,
        GroupMember.user_id==user.id,
        GroupMember.path==path
    ))

    result = await session.execute(query)
    if result.rowcount == 0:
        raise HTTPException(
            status_code=404, 
            detail=f"gallery `{path}` was not found in favorites"
        )
    else:
        await session.commit()

@api_router.post('/group')
async def create_group(
    name: str,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    group = Group(user_id=user.id, name=name)
    session.add(group)
    try:
        await session.commit()
    except IntegrityError as e:
        await session.rollback()
        raise HTTPException(
            status_code=409, 
            detail="Group already exists"
        )



@api_router.delete('/group')
async def delete_group(
    name: str,
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    pass

@api_router.post('/gallery')
async def add_gallery(
    path: Path = Query(...),
    nickname: str = Query(None),
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    await services.add_gallery_to_db(path, user, session, nickname)


@api_router.get('/gallery')
async def check_gallery(
    path: Path = Query(...),
    nickname: str = Query(None),
    user: User = Depends(current_active_user),
    session: AsyncSession = Depends(get_async_session),
):
    return await services.check_gallery_in_db(
        path, 
        user, 
        session, 
        nickname
    )

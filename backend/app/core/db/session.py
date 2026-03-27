from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine

from app.core.db.base import AuthBase
from app.core.config import settings
from app.library.models import (Group,  GroupMember, GroupChild, Gallery)

if settings.DB_SOURCE == 'postgres':
    DATABASE_URL = (
        f"postgresql+asyncpg://{settings.DB_USER}"
        f":{settings.DB_PASSWD}@{settings.DB_HOST}"
        f":{settings.DB_PORT}/{settings.DB_NAME}"
    )
elif settings.DB_SOURCE == 'sqlite':
    DATABASE_URL = 'sqlite+aiosqlite:///creader.db'
else:
    raise ValueError("DB_SOURCE should be `postgres` or `sqlite`")

engine = create_async_engine(DATABASE_URL)
async_session_maker = async_sessionmaker(engine, expire_on_commit=False)


async def create_db_and_tables():
    async with engine.begin() as conn:
        await conn.run_sync(AuthBase.metadata.create_all)


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session

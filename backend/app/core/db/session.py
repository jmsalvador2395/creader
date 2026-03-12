from sqlmodel import create_engine

from app.core.config import settings


if settings.DB_SOURCE == 'postgres':
    connect_str = (
        f"postgresql+asyncpg://{settings.DB_USER}
        f":{settings.DB_PASSWD}@{settings.DB_HOST}"
elif settings.DB_SOURCE == 'sqlite':
    connect_str = 'sqlite+aiosqlite3:///creader.db'
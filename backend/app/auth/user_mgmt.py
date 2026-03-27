import uuid

from fastapi import Depends, Request
from fastapi_users import BaseUserManager, FastAPIUsers, UUIDIDMixin
from fastapi_users.authentication import (
    AuthenticationBackend,
    CookieTransport,
)
from fastapi_users.authentication.strategy.db import AccessTokenDatabase, DatabaseStrategy
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import async_sessionmaker

from app.core.config import settings
from app.core.globals import logger
from app.common.models.user import User, get_user_db
from app.common.models.access_token import AccessToken, get_access_token_db
from app.library.models import Group

class UserManager(UUIDIDMixin, BaseUserManager[User, uuid.UUID]):
    reset_password_token_secret = settings.SECRET
    verification_token_secret = settings.SECRET

    async def authenticate(self, credentials) -> User | None:
        # Try email first, then username
        user = await self.user_db.session.scalar(
            select(User).where(
                (User.email == credentials.username) | (User.username == credentials.username)
            )
        )
        if user is None or not self.password_helper.verify_and_update(
            credentials.password, user.hashed_password
        )[0]:
            return None
        return user

    async def on_after_register(self, user: User, request: Request | None = None):
        logger.log(20, f"User {user.id} has registered.")

        session = self.user_db.session

        user_count = await session.scalar(select(func.count()).select_from(User))
        if user_count == 1:
            user.is_superuser = True
            user.is_active = True
            user.is_verified = True
            session.add(user)
            logger.log(20, f"User {user.id} set as admin")

        # add favorites group
        favorites = Group(user_id=user.id, name="Favorites")
        session.add(favorites)
        await session.commit()
        logger.log(20, f"Created `Favorites` group for user {user.id}")

    async def on_after_forgot_password(
        self, user: User, token: str, request: Request | None = None
    ):
        logger.log(20, f"User {user.id} has forgot their password. Reset token: {token}")

    async def on_after_request_verify(
        self, user: User, token: str, request: Request | None = None
    ):
        logger.log(20, f"Verification requested for user {user.id}. Verification token: {token}")


async def get_user_manager(user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    yield UserManager(user_db)


cookie_transport = CookieTransport(
    cookie_max_age=settings.COOKIE_MAX_AGE,
    cookie_secure=False,
)

def get_database_strategy(
    access_token_db: AccessTokenDatabase[AccessToken] = Depends(get_access_token_db),
) -> DatabaseStrategy:
    return DatabaseStrategy(access_token_db, lifetime_seconds=settings.COOKIE_MAX_AGE)

auth_backend = AuthenticationBackend(
    name="db_auth",
    transport=cookie_transport,
    get_strategy=get_database_strategy,
)

fastapi_users = FastAPIUsers[User, uuid.UUID](get_user_manager, [auth_backend])
current_active_user = fastapi_users.current_user(active=True)
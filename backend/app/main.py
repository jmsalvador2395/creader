from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from typing import Union
from fastapi_pagination import add_pagination
from contextlib import asynccontextmanager

from app.files.routes import api_router as file_router
from app.media.routes import api_router as media_router
from app.library.routes import api_router as library_router
from app.core.config import settings
from app.core.globals import logger
from app.core.db.session import create_db_and_tables
from app.common.models.user import User
from app.common.models.access_token import AccessToken
from app.auth.user_mgmt import auth_backend, current_active_user, fastapi_users
from app.auth.schemas import UserCreate, UserRead, UserUpdate

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_db_and_tables()
    logger.log(20, "CREATED DATABASE AND TABLES")
    yield

app = FastAPI(lifespan=lifespan)
add_pagination(app)

origins = [
    settings.FRONTEND_URL,
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# authentication routes
app.include_router(
    fastapi_users.get_auth_router(auth_backend), 
    prefix="/auth", 
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_reset_password_router(),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_verify_router(UserRead),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

# app routes
app.include_router(file_router, prefix=settings.API_V1_STR)
app.include_router(library_router, prefix=settings.API_V1_STR)
app.include_router(media_router)

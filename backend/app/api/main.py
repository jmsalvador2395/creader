from fastapi import APIRouter
from app.api.routes import auth, directory, library
from app.core.config import settings

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(directory.router)
api_router.include_router(library.router)

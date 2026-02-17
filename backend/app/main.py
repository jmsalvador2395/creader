from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Union


from app.files.routes import api_router as file_router
from app.media.routes import api_router as media_router
from app.core.config import settings


app = FastAPI()

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


app.include_router(file_router, prefix=settings.API_V1_STR)
app.include_router(media_router)

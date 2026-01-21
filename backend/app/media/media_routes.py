from fastapi import APIRouter
from app.api.routes import auth, directory
from app.core.config import settings
from pathlib import Path

api_router = APIRouter(prefix='/media', tags=['media'])


@api_router.get('/get')
def media_get(path: Path=None):
    return {
            'result': f'got {path}, type: {type(path)}'
    }
    


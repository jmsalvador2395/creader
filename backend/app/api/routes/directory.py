from fastapi import APIRouter, Depends, HTTPException, UploadFile, Query
from fastapi.security import OAuth2PasswordBearer
from os import stat_result
from pydantic import BaseModel
from pathlib import Path
from typing import Annotated, Optional, List

from app.core import config
from app.core.utils import (
    is_supported_image, is_supported_video, is_zip,
    is_supported_archive, has_images,
)

settings = config.settings
router = APIRouter(prefix='/directory', tags=['directory'])

def get_file_info(f):

    stat: stat_result = f.stat()
    return {
        'name': f.name,
        'st_size': stat.st_size,
        'st_mtime': stat.st_mtime,
        'path': f.relative_to(settings.BROWSER_ROOT),
        'parent': f.parent.relative_to(settings.BROWSER_ROOT),
        'is_file': f.is_file(),
        'is_dir': f.is_dir(),
        'is_supported_archive': is_supported_archive,
    }

@router.get('/info')
def info(p: Path=Query(...)):
    target = settings.BROWSER_ROOT / p

    if not target.exists():
        raise HTTPException(status_code=404, detail='Invalid Path')

    return get_file_info(target)

@router.get('/resolve_target')
def resolve_target(p: Path=Query(...)):
    target = settings.BROWSER_ROOT / p

    if not target.exists():
        raise HTTPException(status_code=404, detail='Invalid Path')
    
    info = get_file_info(target)

    if info['is_supported_archive']:
        return {
            'container': info['parent'],
            'file': info['name'],
        }
    if info['is_file']:
        return {
            'container': info['parent'],
            'file': info['name'],
        }

    # TODO finish this
    return {
        'container': '',
        'file': '',
    }


@router.get('/browse')
def browse(path: str=''):
    """returns the list of files and folders contained in `path`
    """

    target = settings.BROWSER_ROOT / path

    if not target.exists() or not target.is_dir():
        raise HTTPException(status_code=404, detail='Invalid Path')
    files = [get_file_info(f) for f in target.iterdir()]

    return {'contents': files, 'requested_path': path}

# TODO implement file uploads
# @router.post('/upload')
# def upload(file: UploadFile):
@router.post('/upload')
def upload():
    return {'message': 'uploaded file'}


class FileList(BaseModel):
    files: List[str] | str

# TODO implement file deletion
@router.delete('/delete')
def delete(files: FileList):
    print(files)
    return {'status': 'done'}


# TODO implement file movement
class FileMove(BaseModel):
    source: List[str] | str
    destination: str


# TODO implment file movement
@router.post('/move')
def move(files: FileMove):
    print(f'src: {source}\ndest: {destination}')

    return {'status': 'files moved'}

from fastapi import APIRouter, Depends, HTTPException, UploadFile
from fastapi.security import OAuth2PasswordBearer
from os import stat_result
from pydantic import BaseModel
from pathlib import Path
from typing import Annotated, Optional, List

from app.core import config

settings = config.settings
router = APIRouter(prefix="/directory", tags=["directory"])
    
def get_file_info(target_file):
    stat: stat_result = target_file.stat()
    return {
        'name': target_file.name,
        'st_size': stat.st_size,
        'st_mtime': stat.st_mtime,
        'path': target_file.relative_to(settings.BROWSER_ROOT),
    }

@router.get('/browse')
def browse_root():
    files = [
        get_file_info(f) for f in settings.BROWSER_ROOT.iterdir()
    ]
    return {'contents': files}

# TODO finish file browsing
@router.get('/browse/{path}')
def browse(path: Path):
    """returns the list of files and folders contained in `path`
    
    """

    target_path = settings.BROWSER_ROOT / path

    if not target_path.exists() or not target_path.is_dir():
        raise HTTPException(status_code=404, detail="Invalid Path")
    files = [get_file_info(f) for f in target_path.iterdir()]

    return {'contents': files}

# TODO implement file uploads
# @router.post('/upload')
# def upload(file: UploadFile):
@router.get('/upload')
def upload():
    return {'message': 'uploaded file'}


class FileList(BaseModel):
    files: List[str] | str

# TODO implement file deletion
@router.delete('/delete')
def delete(files: FileList):
    print(files)
    return {"status": "done"}


# TODO implement file movement
class FileMove(BaseModel):
    source: List[str] | str
    destination: str


# TODO implment file movement
@router.post('/move')
def move(files: FileMove):
    print(f'src: {source}\ndest: {destination}')

    return {"status": "files moved"}

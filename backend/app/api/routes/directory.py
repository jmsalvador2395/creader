from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, UploadFile
from pydantic import BaseModel
from fastapi.security import OAuth2PasswordBearer
from pathlib import Path
from app.core import config
from typing import List

settings = config.settings
router = APIRouter(prefix="/directory", tags=["directory"])

@router.get('/browse/{path}')
def browse(path: Path | None):
    """returns the lsit of files and folders contained in `path`
    
    :param path: The directory path relative to settings.BROWSER_ROOT
    :type path: Path | None
    """

    target_path = settings.BROWSER_ROOT
    if path:
        target_path = settings.BROWSER_ROOT / path

    if not target_path.exists() or not target_path.is_dir():
        raise HTTPException(status_code=404, detail="Invalid Path")
    
    def get_file_info(target_file):
        stat = target_file.stat()

        return {
            'name': target_file.name,
            'st_size': stat.st_size,
            'st_mtime': stat.st_mtime,
            'path': target_file.relative_to(settings.BROWSER_ROOT),
        }

    files = [get_file_info(f) for f in target_path.iterdir()]
    return {'contents': files}

# @router.post('/upload')
# def upload(file: UploadFile):
@router.get('/upload')
def upload():
    return {'message': 'uploaded file'}
    

class FileList(BaseModel):
    files: List[str]
@router.delete('/delete')
def delete(files: FileList):
    print(files)
    return {"status": "done"}
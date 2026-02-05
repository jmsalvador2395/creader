from fastapi import APIRouter, Depends, HTTPException, UploadFile, Query
from fastapi.security import OAuth2PasswordBearer
from os import stat_result
from pydantic import BaseModel
from pathlib import Path
from typing import Annotated, Optional, List
from zipfile import ZipFile, BadZipFile

from app.core import config

from app.files.metadata import (
    is_supported_image, is_supported_video, is_zip,
    is_supported_archive, has_images
)
from app.files.storage import get_file_info

settings = config.settings
router = APIRouter(prefix='/directory', tags=['directory'])

@router.get('/info')
def info(p: Path=Query('')):
    target = settings.BROWSER_ROOT / p

    if not target.exists():
        raise HTTPException(status_code=404, detail='Invalid Path')

    return get_file_info(target)

@router.get('/list_entries')
def list_entries(p: Path=Query(''), img: bool=Query(False)):
    target = settings.BROWSER_ROOT / p
    info = get_file_info(target)
    
    if target.suffix.lower() == '.zip':
        try:
            with ZipFile(target, 'r') as zf:
                flist = zf.namelist()
            return flist

        except BadZipfile as e:
            raise ArchiveOpenError(
                f"failed to open archive: {e}"
            )
    elif target.is_dir():
        flist = target.iterdir()

    if img:
        flist = list(filter(
            lambda x: is_supported_image(Path(x)),
            flist
        ))
    return flist

@router.get('/resolve_target')
def resolve_target(p: Path=Query(...)):
    target = settings.BROWSER_ROOT / p

    if not target.exists():
        raise HTTPException(status_code=404, detail='Invalid Path')
    
    info = get_file_info(target)

    if info['is_supported_archive']:
        if str(target).endswith('.zip'):
            try:
                flist = list_entries(target)
                resp = {
                    'container': target,
                    'file': flist[0],
                }
                return resp
            except Exception as e:
                raise HTTPException(
                    status_code=404, 
                    detail='Failed to open zip file'
                )
        else:
            raise HTTPException(status_code=404, detail='Invalid Archive')
        return {
            'container': info['parent'],
            'file': info['name'],
        }
    if info['is_supported_image']:
        return {
            'container': info['parent'],
            'file': info['name'],
        }
    if info['is_dir']:
        flist = list(filter(
            lambda x: is_supported_image(x),
            target.iterdir()
        ))
        return {
            'container': target,
            'file': flist[0],
        }

    raise HTTPException(
        status_code=404, 
        detail='Invalid path to resolve'
    )


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

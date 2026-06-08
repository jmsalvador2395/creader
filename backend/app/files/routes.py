import math
from fastapi import APIRouter, Depends, HTTPException, UploadFile, Query
from fastapi.security import OAuth2PasswordBearer
from os import stat_result
from pydantic import BaseModel
from pathlib import Path
from typing import Annotated, Optional, List
from zipfile import ZipFile, BadZipFile
from io import BytesIO
from fastapi_pagination import Page, paginate

from app.core import config
from app.core.globals import logger

from . import services
settings = config.settings
api_router = APIRouter(prefix='/directory', tags=['directory'])

@api_router.get('/info')
async def info(p: Path=Query('')):
    target = settings.BROWSER_ROOT / p

    if not target.exists():
        raise HTTPException(status_code=404, detail='Invalid Path')

    return services.get_file_info(target)

@api_router.get('/list-entries')
async def list_entries(
    p: Path=Query(''), 
    img: bool=Query(False),
    by: str=Query('name'),
):
    return services.list_entries_in_container(p, img, by)


@api_router.get('/resolve-target')
async def resolve_target(p: Path=Query(...)):
    target = settings.BROWSER_ROOT / p

    if not target.exists():
        raise HTTPException(status_code=404, detail='Invalid Path')
    
    info = services.get_file_info(target)

    if info['is_supported_archive']:
        if target.suffix in settings.ZIP_FILES:
            try:
                flist = services.get_file_list(target, True)
                logger.info(f'flist: {flist}')
                resp = {
                    'container': target.relative_to(settings.BROWSER_ROOT),
                    'file': flist[0]['name'],
                }
                return resp
            except Exception as e:
                raise HTTPException(
                    status_code=404, 
                    detail='Failed to open zip file'
                )
        else:
            raise HTTPException(status_code=500, detail='Failed to read archive')
    if info['is_supported_image']:
        return {
            'container': info['parent'],
            'file': info['name'],
        }
    if info['is_dir']:
        flist = await list_entries(target, img=True)
        if len(flist) == 0:
            raise HTTPException(status_code=404, detail="no images in target")
        return {
            'container': target.relative_to(settings.BROWSER_ROOT),
            'file': flist[0]['name'],
        }

    raise HTTPException(
        status_code=404, 
        detail='Invalid path to resolve'
    )


@api_router.get('/browse')
async def browse(
    path: str=Query(''),
    page: int=Query(1),
    size: int=Query(50),
    search: str=Query(''),
):
    """returns the list of files and folders contained in `path`
    """
    target = settings.BROWSER_ROOT / path

    if not target.exists() or not target.is_dir():
        logger.log(20, f"invalid path: {target}")
        raise HTTPException(status_code=404, detail='Invalid Path')

    files = sorted(
        [services.get_file_info(f) for f in target.iterdir()],
        key=lambda x: (~x['is_dir'], -x['st_mtime']),
    )

    if search != '':
        files = list(filter(
            lambda item: search in item['name'].lower(),
            files
        ))

    start = max((page - 1) * size, 0)
    page = page if start != 0 else 0

    # return {'contents': files, 'requested_path': path}
    return {
        'contents': files[start:start + size], 
        'requested_path': path,
        'page': page,
        'page_size': size,
        'num_pages': math.ceil(len(files) / size),
    }

# TODO implement file uploads
# @router.post('/upload')
# def upload(file: UploadFile):
@api_router.post('/upload')
def upload():
    return {'message': 'uploaded file'}

class FileList(BaseModel):
    files: List[str] | str

# TODO implement file deletion
@api_router.delete('/delete')
def delete(files: FileList):
    print(files)
    return {'status': 'done'}


# TODO implement file movement
class FileMove(BaseModel):
    source: List[str] | str
    destination: str


# TODO implment file movement
@api_router.post('/move')
async def move(files: FileMove):
    print(f'src: {source}\ndest: {destination}')

    return {'status': 'files moved'}

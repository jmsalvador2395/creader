from fastapi import APIRouter, Depends, HTTPException, UploadFile, Query
from fastapi.security import OAuth2PasswordBearer
from os import stat_result
from pydantic import BaseModel
from pathlib import Path
from typing import Annotated, Optional, List
from zipfile import ZipFile, BadZipFile
from PIL import Image
from io import BytesIO

from app.core import config

from app.files.metadata import (
    is_supported_image, is_supported_video, is_zip,
    is_supported_archive, has_images
)
from app.files.storage import get_file_info

settings = config.settings
api_router = APIRouter(prefix='/directory', tags=['directory'])

@api_router.get('/info')
async def info(p: Path=Query('')):
    target = settings.BROWSER_ROOT / p

    if not target.exists():
        raise HTTPException(status_code=404, detail='Invalid Path')

    return get_file_info(target)

@api_router.get('/list-entries')
async def list_entries(
    p: Path=Query(''), 
    img: bool=Query(False),
):
    print(f'img is {img}')
    target = settings.BROWSER_ROOT / p
    if not target.exists():
        raise HTTPException(
            status_code=404, 
            detail='Invalid Path: {str(p)}'
        )
    info = get_file_info(target)
    
    if target.suffix.lower() == '.zip':
        try:
            with ZipFile(target, 'r') as zf:
                flist = zf.namelist()
                if img:
                    flist = list(filter(
                        lambda x: is_supported_image(Path(x)),
                        flist
                    ))
                    flist = [
                        {
                            'name': f,
                            **dict(zip(
                                ['w', 'h'], 
                                Image.open(BytesIO(zf.read(f))).size
                            ))
                        }
                        for f in flist
                    ]
            return flist

        except BadZipFile as e:
            raise HTTPException(
                status_code=500, 
                detail=f"failed to open archive: {e}"
            )
    elif not target.is_dir():
        raise HTTPException(
            status_code=404, 
            detail=f"Unsupported container {str(target)}"
        )
    flist = target.iterdir()
    if img:
        flist = list(filter(
            lambda x: is_supported_image(Path(x)),
            flist
        ))
        flist = sorted([
            {
                'name': f.name,
                **dict(zip(
                    ['w', 'h'], 
                    Image.open(f).size
                ))
            }
            for f in flist
        ], key=lambda x: x['name'])
    return flist

@api_router.get('/resolve-target')
async def resolve_target(p: Path=Query(...)):
    target = settings.BROWSER_ROOT / p

    if not target.exists():
        raise HTTPException(status_code=404, detail='Invalid Path')
    
    info = get_file_info(target)

    if info['is_supported_archive']:
        if str(target).endswith('.zip'):
            try:
                flist = await list_entries(target, img=True)
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
            'container': target.relative_to(settings.BROWSER_ROOT),
            'file': flist[0],
        }

    raise HTTPException(
        status_code=404, 
        detail='Invalid path to resolve'
    )


@api_router.get('/browse')
async def browse(path: str=''):
    """returns the list of files and folders contained in `path`
    """
    target = settings.BROWSER_ROOT / path

    if not target.exists() or not target.is_dir():
        raise HTTPException(status_code=404, detail='Invalid Path')

    files = sorted(
        [get_file_info(f) for f in target.iterdir()],
        key=lambda x: (~x['is_dir'], -x['st_mtime']),
    )

    return {'contents': files, 'requested_path': path}

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

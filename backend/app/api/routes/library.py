from fastapi import APIRouter, Depends, HTTPException, UploadFile, Query
from fastapi.security import OAuth2PasswordBearer
from os import stat_result
from pydantic import BaseModel
from pathlib import Path
from typing import Annotated, Optional, List
from zipfile import ZipFile

from app.core import config
from app.files.metadata import (
    is_supported_image, is_supported_video, is_zip,
    is_supported_archive, has_images
)

settings = config.settings
router = APIRouter(prefix='/library', tags=['directory'])

router.get('container-files')
def get_container_files(p: Path):
    info = 1
    if is_zip(path):
        members = []
    else:
        members = []
    return {
        'members': members,
    }

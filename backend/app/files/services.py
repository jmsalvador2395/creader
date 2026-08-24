import re
from pathlib import Path
from typing import Union
from PIL import Image
from io import BytesIO
from fastapi import Request

from app.core.config import settings
from app.common.files import is_supported_archive, is_supported_image
from app.core.globals import logger
from app.common.urls import build_url

from zipfile import ZipFile, BadZipFile

def natural_sort_key(p):
    return [
        int(c) if c.isdigit() else c.lower() 
        for c in re.split(r'(\d+)', str(p))
    ]

def get_file_info(p: Path):

    stat = p.stat()
    return {
        'name': p.name,
        'st_size': stat.st_size,
        'st_mtime': stat.st_mtime,
        'path': p.relative_to(settings.BROWSER_ROOT),
        'parent': p.parent.relative_to(settings.BROWSER_ROOT),
        'is_file': p.is_file(),
        'is_dir': p.is_dir(),
        'is_supported_archive': is_supported_archive(p),
        'is_supported_image': is_supported_image(p),
    }

def list_entries_in_container(
    p: Path, 
    img: bool,
    by: str=None,
    request: Request=None,
):
    logger.log(20, f"listing entries for `{str(p)}`")
    target = settings.BROWSER_ROOT / p
    items = get_file_list(target, img)

    if img:
        items = [
            item | {
                'link': build_url(
                    'media:container-image', 
                    request=None, 
                    c=str(p), 
                    img=item['name']
                ),
                'thumbnailLink': build_url(
                    'media:container-thumbnail', 
                    request=None, 
                    c=str(p), 
                    img=item['name']
                ),
            }
            for item in items
        ]

    return items

def get_file_list(target, img=None):

    def _file_entry(container, f, img):
        path = Path(f).relative_to(settings.BROWSER_ROOT)
        width, height = img.size
        return {
            'container': container,
            'name': f.name, 
            'w': width, 
            'h': height,
        }

    def _zip_entry(container, name, img):
        width, height = img.size
        return {
            'container': str(container),
            'name': name, 
            'w': width, 
            'h': height,
            'img-url': None,
            'thumb-url': None,
        }

    if target.suffix.lower() in settings.ZIP_FILES:
        with ZipFile(target, 'r') as zf:
            logger.info(f"opened {str(target)} as zf")
            flist = zf.namelist()
            if img:
                flist = list(filter(
                    lambda x: is_supported_image(Path(x)),
                    flist
                ))
                flist = [
                    _zip_entry(
                        target.relative_to(settings.BROWSER_ROOT),
                        f, 
                        Image.open(BytesIO(zf.read(f)))
                    )
                    for f in flist
                ]
        return sorted(flist, key=natural_sort_key)

    elif not target.is_dir():
        msg = f"Unsupported target: {target}"
        logger.error(msg)
        raise ValueError(msg)
    flist = target.iterdir()
    if img:

        flist = list(filter(
            lambda x: is_supported_image(Path(x)),
            flist
        ))
        flist = sorted(
            # [_folder_entry(f) for f in flist], 
            [_file_entry(target, f, Image.open(f)) for f in flist], 
            key=natural_sort_key
        )
    return flist

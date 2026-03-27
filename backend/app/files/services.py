import re
from pathlib import Path
from typing import Union
from PIL import Image
from io import BytesIO

from app.core.config import settings
from app.common.files import is_supported_archive, is_supported_image

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

def get_file_list(target, img=None):

    if target.suffix.lower() in settings.ZIP_FILES:
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
        return sorted(flist, key=natural_sort_key)

    elif not target.is_dir():
        raise ValueError(f"Unsupported target: {target}")
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
        # ], key=lambda x: x['name'])
        ], key=natural_sort_key)
    return flist

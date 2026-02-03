from pathlib import Path

from app.core.config import settings

from app.files.validators import (
    is_supported_image, is_supported_video, is_zip,
    is_supported_archive,
)

class ArchiveOpenError(Exception):
    pass

from zipfile import ZipFile, BadZipFile

def get_file_info(p: Path):

    stat: stat_result = p.stat()
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

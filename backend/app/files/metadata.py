from pathlib import Path
from typing import Union
from app.core.config import settings

def _convert_to_path(p: Union[Path, str]):
    assert (isinstance(p, Path) or isinstance(p, str)), (
        f'expected Path or str, got {type(p)}'
    )
    if type(p) == str:
        return Path(p)
    return p


def get_media_type(p: Union[Path, str]):
    """returns the media type based on the file extension
    """
    p = _convert_to_path(p)
    p = p.resolve()
    assert p.exists(), f"p {p} does not exist."

    if p.is_dir() and has_images(p):
        return 'gallery'
    elif is_supported_archive:
        return 'archive'
    else:
        return ''

def get_mime_type(p: Union[Path, str]):
    """returns the MIME type based on the file extension
    """
    p = _convert_to_path(p)
    ext = p.suffix.lower()
    ext_map = {
        '.mp4': 'video/mp4',
        '.webm': 'video/webm',
        '.mkv': 'video/x-matroska',
        '.avi': 'video/x-msvideo',
        '.mov': 'video/quicktime',
        '.flv': 'video/x-flv',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.bmp': 'image/bmp',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml',
    }

    return ext_map.get(ext, 'application/octet-stream')

def has_images(path: Union[Path, str]):
    """checks if the directory contains any supported image files
    """
    p = _convert_to_path(p)
    if not path.is_dir():
        return False
    members = path.iterdir()
    for member in members:
        if member.is_file() and is_supported_image(member):
            return True
    return False

def is_supported_image(p: Union[Path, str]):
    """checks if the file is in SUPPORTED_IMAGE_EXTENSIONS
    """
    p = _convert_to_path(p)
    ext = p.suffix.lower()
    return ext in settings.SUPPORTED_IMAGE_EXTENSIONS

def is_supported_video(p: Union[Path, str]):
    """checks if the p is in SUPPORTED_VIDEO_EXTENSIONS
    """
    p = _convert_to_path(p)
    ext = p.suffix.lower()
    return ext in settings.SUPPORTED_VIDEO_EXTENSIONS

def is_zip(p: Union[Path, str]):
    p = _convert_to_path(p)
    return p.suffix.lower() in settings.SUPPORTED_ARCHIVES


def is_supported_archive(p: Union[Path, str]):
    """checks if the file is in SUPPORTED_ARCHIVES
    """
    p = _convert_to_path(p)
    return is_zip(p) #or p.suffix.lower() == '.rar'

def is_importable(p: Union[Path, str]):
    """checks if the path provided can be imported as a Media object
    """
    p = _convert_to_path(p)

    return (
        (p.is_dir() and has_images(p)) 
        or is_supported_archive(p)
        or is_supported_video(p)
    )

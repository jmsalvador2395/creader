from pathlib import Path
from app.core.config import settings

from .metadata import has_images

def is_supported_image(p: Path):
    """checks if the file is in SUPPORTED_IMAGE_EXTENSIONS
    """
    ext = p.suffix.lower()
    return ext in settings.SUPPORTED_IMAGE_EXTENSIONS

def is_supported_video(p: Path):
    """checks if the p is in SUPPORTED_VIDEO_EXTENSIONS
    """
    ext = p.suffix.lower()
    return ext in settings.SUPPORTED_VIDEO_EXTENSIONS

def is_zip(p: Path):
    return p.suffix.lower() in settings.SUPPORTED_ARCHIVES


def is_supported_archive(p: Path):
    """checks if the file is in SUPPORTED_ARCHIVES
    """
    return is_zip(p) #or p.suffix.lower() == '.rar'

def is_importable(p: Path):
    """checks if the path provided can be imported as a Media object
    """
    return (
        (p.is_dir() and has_images(p)) 
        or is_supported_archive(p)
        or is_supported_video(p)
    )

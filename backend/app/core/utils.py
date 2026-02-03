from pathlib import Path

def is_supported_image(filename: Path):
    """checks if the filename is in SUPPORTED_IMAGE_EXTENSIONS
    """
    SUPPORTED_IMAGE_EXTENSIONS = {
        '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.webp', '.svg'
    }
    ext = filename.suffix.lower()
    return ext in SUPPORTED_IMAGE_EXTENSIONS

def is_supported_video(filename: Path):
    """checks if the filename is in SUPPORTED_VIDEO_EXTENSIONS
    """
    SUPPORTED_VIDEO_EXTENSIONS = {
        '.mp4', '.mkv', '.avi', '.mov', '.webm', '.flv'
    }
    ext = filename.suffix.lower()
    return ext in SUPPORTED_VIDEO_EXTENSIONS

def is_zip(filename: Path):
    SUPPORTED_ZIP_EXTS = {
        '.zip', '.cbz', '.cbr',
    }
    return filename.suffix.lower() in SUPPORTED_ZIP_EXTS


def is_supported_archive(filename: Path):
    """checks if the filename is in SUPPORTED_ARCHIVES
    """
    return is_zip(filename) #or filename.suffix.lower() == '.rar'

def is_importable(filename: Path):
    """checks if the path provided can be imported as a Media object
    """
    return (
        (filename.is_dir() and has_images(filename)) 
        or is_supported_archive(filename)
        or is_supported_video(filename)
    )

def has_images(path: Path):
    """checks if the directory contains any supported image files
    """
    if not path.is_dir():
        return False
    members = path.iterdir()
    for member in members:
        if member.is_file() and is_supported_image(member):
            return True
    return False

def get_media_type(path: str):
    """returns the media type based on the file extension
    """

    path_obj = Path(path).resolve()
    assert path_obj.exists(), f"Path {path} does not exist."

    if path_obj.is_dir() and has_images(path_obj):
        return 'gallery'
    elif is_supported_archive:
        return 'archive'
    else:
        return ''

def get_mime_type(path: Path):
    """returns the MIME type based on the file extension
    """
    ext = path.suffix.lower()
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


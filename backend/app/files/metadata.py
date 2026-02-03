from pathlib import Path

def get_media_type(path: Path):
    """returns the media type based on the file extension
    """

    path = path.resolve()
    assert path.exists(), f"Path {path} does not exist."

    if path.is_dir() and has_images(path):
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

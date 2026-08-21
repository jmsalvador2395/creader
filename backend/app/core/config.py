from typing import Annotated, Set, Optional
from pathlib import Path
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file="../.env",
        env_ignore_empty=True,
        extra="ignore",
    )
    API_V1_STR: str = "/api/v1"
    ENVIRONMENT: str = "hello"
    FRONTEND_URL: str = 'localhost:5173'
    VITE_API_URL: str = 'localhost:8000'

    # paths
    BROWSER_ROOT: Path
    BACKEND_ROOT: Path = Path(__file__).resolve().parent.parent.parent
    CACHE_DIR: Path = BACKEND_ROOT / '.cache'

    FRONTEND_PORT: int = 5173
    BACKEND_PORT: int = 8000

    DB_SOURCE: str
    
    DB_HOST: Optional[str]
    DB_PASSWD: Optional[str]
    DB_USER: str = "creader"
    DB_PORT: str = '5432'
    DB_NAME: str = "creader"

    SECRET: str
    COOKIE_MAX_AGE: int
    

    SUPPORTED_IMAGE_EXTENSIONS: Set[str] = {
        '.jpg', '.jpeg', '.png', '.gif', 
        '.bmp', '.webp', '.svg',
    }

    SUPPORTED_VIDEO_EXTENSIONS: Set[str] = {
        '.mp4', '.mkv', '.avi', '.mov', 
        '.webm', '.flv',
    }

    SUPPORTED_ARCHIVES: Set[str] = {
        '.zip', '.cbz', '.cbr',
    }

    ZIP_FILES: Set[str] = SUPPORTED_ARCHIVES | set({})

settings = Settings()
settings.CACHE_DIR.mkdir(parents=True, exist_ok=True)

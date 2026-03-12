from typing import Annotated, Set, Optional
from pathlib import Path
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

    BROWSER_ROOT: Path

    FRONTEND_PORT: int = 5173
    BACKEND_PORT: int = 8000

    DB_SOURCE: str
    
    DB_HOST: Optional[str]
    DB_PASSWD: Optional[str]
    DB_USER: Optional[str]
    DB_PORT: str = '5432'
    

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

settings = Settings()

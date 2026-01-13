from typing import Annotated
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
    FRONTEND_URL: str = "localhost:5173"

    BROWSER_ROOT: Path

    FRONTEND_PORT: int = 5173
    BACKEND_PORT: int = 8000

settings = Settings()

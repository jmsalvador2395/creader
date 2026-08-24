from urllib.parse import urlencode

from fastapi import Request
from app.core.app import app
from app.core.config import settings

def build_url(name: str, request: Request | None = None, **query_params) -> str:
    path = (request.app if request else app).url_path_for(name)
    base = str(request.base_url).rstrip('/') if request else settings.VITE_API_URL.rstrip('/')
    url = f"{base}{path}"
    if query_params:
        url += f"?{urlencode(query_params)}"
    return url

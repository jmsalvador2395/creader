from typing import Union
from fastapi import FastAPI, APIRouter
from pydantic import BaseModel

from app.api.main import api_router
from app.core.config import settings


print(settings.ENVIRONMENT)
app = FastAPI()

@app.get("/")
def read_root():
    return {"Hello": "World"}


# @app.get("/items/{item_id}")
# def read_item(item_id: int, q: Union[str, None] = None):
#     return {"item_id": item_id, "q": q}

app.include_router(api_router, prefix=settings.API_V1_STR)
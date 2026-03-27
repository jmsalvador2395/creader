import uuid
from fastapi_users import schemas
from pydantic import BaseModel

class UserBase(BaseModel):
    username: str

class UserRead(UserBase, schemas.BaseUser[uuid.UUID]):
    username: str

class UserCreate(UserBase, schemas.BaseUserCreate):
    username: str

class UserUpdate(UserBase, schemas.BaseUserUpdate):
    username: str
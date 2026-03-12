from fastapi_users.db import SQLModelBaseUserTable
from sqlmodel import Field, SQLModel
from typing import Optional
import uuid

class User(SQLModelBaseUserTable[uuid.UUID], table=True):
    id: uuid.UUID = Field(default_factory=uuid.uuid4, primary_key=True)
    # add any custom fields here
    full_name: Optional[str] = None
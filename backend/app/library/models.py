import uuid
from sqlmodel import SQLModel, Field, UniqueConstraint

class Group(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("user_id", "name"),)

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4, 
        primary_key=True
    )
    user_id: uuid.UUID = Field(foreign_key="user.id")
    name: str

class GroupChild(SQLModel, table=True):
    parent_id: uuid.UUID = Field(foreign_key="group.id", primary_key=True)
    child_id: uuid.UUID = Field(foreign_key="group.id", primary_key=True)

class GroupMember(SQLModel, table=True):
    user_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True)
    group_id: uuid.UUID= Field(foreign_key="group.id", primary_key=True)
    path: str = Field(foreign_key="gallery.path", primary_key=True)

class Gallery(SQLModel, table=True):
    path: str = Field(primary_key=True)
    nickname: str | None = Field(unique=True)

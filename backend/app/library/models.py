import uuid
from datetime import datetime
from sqlmodel import SQLModel, Field, UniqueConstraint
from sqlalchemy import Column, ForeignKey, String

class Group(SQLModel, table=True):
    __table_args__ = (UniqueConstraint("user_id", "name"),)

    id: uuid.UUID = Field(
        default_factory=uuid.uuid4, 
        primary_key=True
    )
    user_id: uuid.UUID = Field(foreign_key="user.id")
    name: str
    date_created: datetime = Field(default_factory=datetime.now)

class GroupChild(SQLModel, table=True):
    parent_id: uuid.UUID = Field(foreign_key="group.id", primary_key=True)
    child_id: uuid.UUID = Field(foreign_key="group.id", primary_key=True)
    date_added: datetime = Field(default_factory=datetime.now)

class GroupMember(SQLModel, table=True):
    user_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True)
    group_id: uuid.UUID= Field(foreign_key="group.id", primary_key=True)
    path: str = Field(
        sa_column=Column(
            String,
            ForeignKey(
                "gallery.path", 
                ondelete="CASCADE",
                onupdate="CASCADE",
            ),
            primary_key=True,
        )
    )

    date_added: datetime = Field(default_factory=datetime.now)

class Gallery(SQLModel, table=True):
    path: str = Field(primary_key=True)
    nickname: str | None = Field(unique=True)
    date_added: datetime = Field(default_factory=datetime.now)
    times_accessed: int = Field(default=0)
    last_accessed: datetime | None = Field(default=None)

class Rating(SQLModel, table=True):
    user_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True)
    path: str = Field(
        sa_column=Column(
            String,
            ForeignKey("gallery.path", ondelete="CASCADE"),
            primary_key=True,
        )
    )
    score: int = Field(default=0, ge=0, le=5)
    date_scored: datetime = Field(default_factory=datetime.now)

class Tag(SQLModel, table=True):
    path: str = Field(
        sa_column=Column(
            String,
            ForeignKey("gallery.path", ondelete="CASCADE"),
            primary_key=True,
        )
    )
    tag_id: int = Field(foreign_key="taglist.id", primary_key=True)
    date_created: datetime = Field(default_factory=datetime.now)

class TagList(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    name: str
    date_created: datetime = Field(default_factory=datetime.now)

class GalleryAuthor(SQLModel, table=True):
    author_id: uuid.UUID = Field(foreign_key="author.id", primary_key=True)
    gallery_path: str = Field(
        sa_column=Column(
            String,
            ForeignKey("gallery.path", ondelete="CASCADE"),
            primary_key=True,
        )
    )

class Author(SQLModel, table=True):
    id: uuid.UUID = Field(
        default_factory=uuid.uuid4, 
        primary_key=True
    )
    name: str
    date_added: datetime = Field(default_factory=datetime.now)
 
class Bookmark(SQLModel, table=True):
    user_id: uuid.UUID = Field(foreign_key="user.id", primary_key=True)
    path: str = Field(
        sa_column=Column(
            String,
            ForeignKey("gallery.path", ondelete="CASCADE"),
            primary_key=True,
        )
    )
    page: str = Field(primary_key=True)


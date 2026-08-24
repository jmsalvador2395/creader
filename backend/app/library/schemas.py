from pydantic import BaseModel, ConfigDict
from typing import List
from datetime import datetime


from .models import Tag, Bookmark, TagList


class GroupInfo(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    name: str
    date_created: datetime
    date_added: datetime

class GalleryInfo(BaseModel):
    path: str
    title: str | None
    author: str | None
    date_added: datetime
    times_accessed: int
    last_accessed: datetime | None
    bookmarks: List[str] | None
    tags: List[str] | None
    groups: List[GroupInfo] | None
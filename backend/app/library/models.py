import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db.base import Base


class Group(Base):
    __tablename__ = "group"
    __table_args__ = (UniqueConstraint("user_id", "name"),)

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE", onupdate="CASCADE")
    )
    name: Mapped[str]
    date_created: Mapped[datetime] = mapped_column(default=datetime.now)


class GroupChild(Base):
    __tablename__ = "groupchild"

    parent_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("group.id", ondelete="CASCADE", onupdate="CASCADE"), 
        primary_key=True
    )
    child_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("group.id", ondelete="CASCADE", onupdate="CASCADE"), 
        primary_key=True
    )
    date_added: Mapped[datetime] = mapped_column(default=datetime.now)


class GroupMember(Base):
    __tablename__ = "groupmember"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE", onupdate="CASCADE"), 
        primary_key=True
    )
    group_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("group.id", ondelete="CASCADE", onupdate="CASCADE"), 
        primary_key=True
    )
    path: Mapped[str] = mapped_column(
        String,
        ForeignKey("gallery.path", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    )
    date_added: Mapped[datetime] = mapped_column(default=datetime.now)


class Gallery(Base):
    __tablename__ = "gallery"

    path: Mapped[str] = mapped_column(primary_key=True)
    title: Mapped[Optional[str]] = mapped_column(unique=True)
    date_added: Mapped[datetime] = mapped_column(default=datetime.now)
    times_accessed: Mapped[int] = mapped_column(default=0)
    last_accessed: Mapped[Optional[datetime]] = mapped_column(default=None)


class Rating(Base):
    __tablename__ = "rating"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE", onupdate="CASCADE"), 
        primary_key=True
    )
    path: Mapped[str] = mapped_column(
        String,
        ForeignKey("gallery.path", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    )
    score: Mapped[int] = mapped_column(default=0)
    date_scored: Mapped[datetime] = mapped_column(default=datetime.now)


class Tag(Base):
    __tablename__ = "tag"

    path: Mapped[str] = mapped_column(
        String,
        ForeignKey("gallery.path", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    )
    tag_id: Mapped[int] = mapped_column(
        ForeignKey("taglist.id", ondelete="CASCADE", onupdate="CASCADE"), 
        primary_key=True
    )
    date_created: Mapped[datetime] = mapped_column(default=datetime.now)


class TagList(Base):
    __tablename__ = "taglist"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str]
    date_created: Mapped[datetime] = mapped_column(default=datetime.now)


class GalleryAuthor(Base):
    __tablename__ = "galleryauthor"

    author_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("author.id", ondelete="CASCADE", onupdate="CASCADE"), 
        primary_key=True
    )
    gallery_path: Mapped[str] = mapped_column(
        String,
        ForeignKey("gallery.path", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    )


class Author(Base):
    __tablename__ = "author"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    name: Mapped[str]
    date_added: Mapped[datetime] = mapped_column(default=datetime.now)


class Bookmark(Base):
    __tablename__ = "bookmark"

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("user.id", ondelete="CASCADE", onupdate="CASCADE"), 
        primary_key=True
    )
    path: Mapped[str] = mapped_column(
        String,
        ForeignKey("gallery.path", ondelete="CASCADE", onupdate="CASCADE"),
        primary_key=True,
    )
    page: Mapped[str] = mapped_column(primary_key=True)

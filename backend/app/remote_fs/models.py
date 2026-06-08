import uuid

from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column

from app.core.db.base import Base


class RemoteFSConnection(Base):
    __tablename__ = "remotefsconnection"

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("user.id"), primary_key=True)
    connection_name: Mapped[str] = mapped_column(primary_key=True)
    connection_type: Mapped[str]

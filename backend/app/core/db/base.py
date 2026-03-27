from sqlalchemy.orm import DeclarativeBase
from sqlmodel import SQLModel


class AuthBase(DeclarativeBase):
    pass

# Share metadata so SQLModel tables can reference auth tables via foreign keys
SQLModel.metadata = AuthBase.metadata

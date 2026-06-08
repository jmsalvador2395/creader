from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass

# Share metadata so SQLModel tables can reference auth tables via foreign keys
# SQLModel.metadata = AuthBase.metadata

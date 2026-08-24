from contextlib import asynccontextmanager

from fastapi import FastAPI


@asynccontextmanager
async def lifespan(app: FastAPI):
    from app.core.db.session import create_db_and_tables
    from app.core.globals import logger

    # to handle remote file system connections
    app.state.remote_fs_con = {}

    await create_db_and_tables()
    logger.log(20, "CREATED DATABASE AND TABLES")
    yield


app = FastAPI(lifespan=lifespan)

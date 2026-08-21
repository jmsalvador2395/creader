import logging
from uvicorn.logging import DefaultFormatter

# fmt = DefaultFormatter("%(levelprefix)s %(message)s")
fmt = DefaultFormatter("%(asctime)s %(levelprefix)s %(message)s", datefmt="%Y-%m-%d %H:%M:%S")


for name in ("uvicorn", "uvicorn.access", "uvicorn.error"):
    for handler in logging.getLogger(name).handlers:
        handler.setFormatter(fmt)

logger = logging.getLogger("creader")
logger.setLevel(logging.INFO)
logger.handlers = logging.getLogger("uvicorn").handlers
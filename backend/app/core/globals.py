import logging

logger = logging.getLogger("creader")
logger.setLevel(logging.INFO)
logger.handlers = logging.getLogger("uvicorn").handlers
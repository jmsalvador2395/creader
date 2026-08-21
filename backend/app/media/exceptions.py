from fastapi import Request
from fastapi.responses import JSONResponse
from zipfile import BadZipFile

def register_media_exception_handlers(app):
    @app.exception_handler(BadZipFile)
    async def bad_zip_handler(request: Request, exc: BadZipFile):
        return JSONResponse(
            status_code=422, 
            content={"detail": f"Failed to open archive: {exc}"}
        )

    @app.exception_handler(FileNotFoundError)
    async def not_found_handler(request: Request, exc: FileNotFoundError):
        return JSONResponse(
            status_code=404, 
            content={"detail": str(exc) or "File not found"}
        )

    @app.exception_handler(PermissionError)
    async def permission_handler(request: Request, exc: PermissionError):
        return JSONResponse(
            status_code=403, 
            content={"detail": "Permission denied"}
        )

    @app.exception_handler(ValueError)
    async def value_error_handler(
        request: Request, 
        exc: ValueError
    ):
        return JSONResponse(
            status_code=415, 
            content={"detail": f"Unsupported: {exc}"}
        )

    @app.exception_handler(OSError)
    async def os_error_handler(request: Request, exc: OSError):
        return JSONResponse(
            status_code=500, 
            content={"detail": f"Server error: {exc}"}
        )

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Aureon Quality Document Control System API",
    description="API for the Pharmaceutical Document Management and Quality Document Control System",
    version="1.0.0",
)

from .config import settings

# Set up CORS
origins = [origin.strip() for origin in settings.cors_origins.split(",") if origin.strip()]

from fastapi import Request
from fastapi.responses import JSONResponse
import logging

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

logger = logging.getLogger("uvicorn.error")

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Global exception: {exc}")
    # Do not expose internal details to the client
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": "Internal Server Error"},
    )

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Aureon API"}

from .api.v1.endpoints import auth

@app.get("/api/v1")
def api_root():
    return {"message": "Welcome to Aureon API v1"}

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])


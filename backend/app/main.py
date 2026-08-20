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
    import traceback
    traceback.print_exc()
    logger.error(f"Global exception: {exc}")
    # Do not expose internal details to the client
    return JSONResponse(
        status_code=500,
        content={"status": "error", "message": str(exc)}, # Also return the error to the client for debugging!
    )

@app.get("/health")
def health_check():
    return {"status": "ok", "service": "Aureon API"}

from .api.v1.endpoints import auth, documents, workflows, audit, search, intelligence, notifications, sharing, dashboard

@app.get("/api/v1")
def api_root():
    return {"message": "Welcome to Aureon API v1"}

app.include_router(auth.router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(search.router, prefix="/api/v1/documents", tags=["search"])
app.include_router(intelligence.router, prefix="/api/v1/documents", tags=["intelligence"])
app.include_router(documents.router, prefix="/api/v1/documents", tags=["documents"])
app.include_router(workflows.router, prefix="/api/v1", tags=["workflows"])
app.include_router(audit.router, prefix="/api/v1", tags=["audit"])
app.include_router(notifications.router, prefix="/api/v1", tags=["notifications"])
app.include_router(sharing.router, prefix="/api/v1", tags=["sharing"])
app.include_router(dashboard.router, prefix="/api/v1/dashboard", tags=["dashboard"])

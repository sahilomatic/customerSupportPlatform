import os
import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1.router import api_v1_router

# ---------------------------
# Configure Logging
# ---------------------------
logging.basicConfig(
    level=logging.DEBUG,  # Show DEBUG logs
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# ---------------------------
# Create FastAPI App
# ---------------------------
def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=settings.DESCRIPTION,
        debug=True  # Enable debug for local development
    )

    # ---------------------------
    # CORS Middleware
    # ---------------------------
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:5173",      # Local development
            "https://sahilomatic.github.io",  # GitHub Pages frontend
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ---------------------------
    # Routers
    # ---------------------------
    app.include_router(api_v1_router, prefix="/api/v1")

    # ---------------------------
    # Root Endpoint
    # ---------------------------
    @app.get("/")
    async def root():
        logger.debug("Root endpoint called")
        print("Root endpoint accessed")
        return {"message": "Communication API", "version": settings.VERSION}

    # ---------------------------
    # Health Check Endpoint
    # ---------------------------
    @app.get("/health")
    async def health_check():
        logger.debug("Health check called")
        print("Health check accessed")
        return {"status": "healthy"}

    return app


# ---------------------------
# Initialize App
# ---------------------------
app = create_app()


# ---------------------------
# Uvicorn Entry Point
# ---------------------------
if __name__ == "__main__":
    import uvicorn

    # Use Render's dynamic port if available, else default to 8000 locally
    port = int(os.getenv("PORT", 8000))

    # If running locally -> enable reload + debug
    is_local = os.getenv("RENDER", "false").lower() != "true"

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=port,
        reload=is_local,        # Reload only for local dev
        log_level="debug",
        debug=is_local
    )

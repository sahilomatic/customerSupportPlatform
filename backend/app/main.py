import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.api.v1.router import api_v1_router

# Configure logging at DEBUG level
logging.basicConfig(
    level=logging.DEBUG,  # <-- DEBUG logs will show
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.PROJECT_NAME,
        version=settings.VERSION,
        description=settings.DESCRIPTION,
        debug=True  # <-- Enable debug mode in FastAPI
    )
    
    app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # local dev
        "https://sahilomatic.github.io/customerSupportPlatform/",  # deployed frontend
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

    
    app.include_router(api_v1_router, prefix="/api/v1")
    
    @app.get("/")
    async def root():
        logger.debug("Root endpoint called")  # Example debug log
        print("Root endpoint accessed")       # Print statement
        return {"message": "Communication API", "version": settings.VERSION}
    
    @app.get("/health")
    async def health_check():
        logger.debug("Health check called")
        print("Health check accessed")
        return {"status": "healthy"}
    
    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        debug=True,     # <-- Uvicorn debug mode
        log_level="debug"  # <-- Show DEBUG logs
    )

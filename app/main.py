from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import router
import logging

# Set up logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Create FastAPI app
app = FastAPI(
    title="Lead Scoring API",
    description="Advanced lead scoring and management system with enhanced algorithm",
    version="2.0.0"
)

# Configure CORS
origins = [
    "http://localhost:3000",  # React dev server
    "http://localhost:5000",  # Production build
    "http://localhost:8000",  # Alternative port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Routes
app.include_router(router)

@app.get("/")
def root():
    """Root endpoint for the API"""
    logger.info("Root endpoint accessed")
    return {
        "status": "online",
        "message": "Advanced Lead Scoring API is running!",
        "documentation": "/docs",
        "openapi": "/openapi.json"
    }

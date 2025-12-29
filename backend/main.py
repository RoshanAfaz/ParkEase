"""
ParkEasy Backend API - FastAPI application with MongoDB.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging

from config import settings
from database import connect_to_mongo, close_mongo_connection
from routers import (
    auth_router,
    parking_router,
    booking_router,
    vehicle_router,
    review_router,
    analytics_router,
    admin_router,
    payment_router
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan events."""
    # Startup
    logger.info("Starting ParkEasy Backend API...")
    await connect_to_mongo()
    logger.info("Application started successfully")
    
    yield
    
    # Shutdown
    logger.info("Shutting down ParkEasy Backend API...")
    await close_mongo_connection()
    logger.info("Application shut down successfully")


# Create FastAPI app
app = FastAPI(
    title="ParkEasy API",
    description="Backend API for ParkEasy - Smart Parking Management System",
    version="1.0.0",
    lifespan=lifespan
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router.router)
app.include_router(parking_router.router)
app.include_router(booking_router.router)
app.include_router(vehicle_router.router)
app.include_router(review_router.router)
app.include_router(analytics_router.router)
app.include_router(admin_router.router)
app.include_router(payment_router.router)


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "message": "Welcome to ParkEasy API",
        "version": "1.0.0",
        "docs": "/docs",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint."""
    return {
        "status": "healthy",
        "database": "connected"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
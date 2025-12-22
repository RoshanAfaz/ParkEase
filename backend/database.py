"""
MongoDB database connection and initialization.
"""
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo import ASCENDING, DESCENDING, GEO2D
from config import settings
import logging

logger = logging.getLogger(__name__)


class Database:
    client: AsyncIOMotorClient = None
    db = None


db_instance = Database()


async def connect_to_mongo():
    """Connect to MongoDB and create indexes."""
    try:
        logger.info(f"Connecting to MongoDB at {settings.mongodb_url}")
        db_instance.client = AsyncIOMotorClient(settings.mongodb_url)
        db_instance.db = db_instance.client[settings.database_name]
        
        # Test connection
        await db_instance.client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
        
        # Create indexes
        await create_indexes()
        
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise


async def close_mongo_connection():
    """Close MongoDB connection."""
    try:
        if db_instance.client:
            db_instance.client.close()
            logger.info("MongoDB connection closed")
    except Exception as e:
        logger.error(f"Error closing MongoDB connection: {e}")


async def create_indexes():
    """Create database indexes for better query performance."""
    try:
        db = db_instance.db
        
        # Users collection indexes
        await db.users.create_index("email", unique=True)
        await db.users.create_index("role")
        
        # Parking lots collection indexes
        await db.parking_lots.create_index([("location", GEO2D)])
        await db.parking_lots.create_index("is_active")
        await db.parking_lots.create_index("name")
        
        # Bookings collection indexes
        await db.bookings.create_index("user_id")
        await db.bookings.create_index("lot_id")
        await db.bookings.create_index("status")
        await db.bookings.create_index([("start_time", DESCENDING)])
        await db.bookings.create_index([("end_time", DESCENDING)])
        
        # Reviews collection indexes
        await db.reviews.create_index("lot_id")
        await db.reviews.create_index("user_id")
        await db.reviews.create_index([("created_at", DESCENDING)])
        
        # Vehicles collection indexes
        await db.vehicles.create_index("user_id")
        await db.vehicles.create_index("license_plate", unique=True)
        
        # Payments collection indexes
        await db.payments.create_index("booking_id")
        await db.payments.create_index("user_id")
        await db.payments.create_index("status")
        
        logger.info("Database indexes created successfully")
        
    except Exception as e:
        logger.error(f"Error creating indexes: {e}")


def get_database():
    """Get database instance."""
    return db_instance.db
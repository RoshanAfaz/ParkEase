"""
Seed script to populate the database with sample data.
Run this after setting up the backend to get started quickly.
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from auth import get_password_hash
from config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def seed_database():
    """Seed the database with sample data."""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.database_name]
    
    logger.info("Starting database seeding...")
    
    # Clear existing data (optional - comment out if you want to keep existing data)
    # await db.users.delete_many({})
    # await db.parking_lots.delete_many({})
    # await db.parking_slots.delete_many({})
    # await db.vehicles.delete_many({})
    # await db.bookings.delete_many({})
    # await db.reviews.delete_many({})
    
    # Create admin user
    admin_password = get_password_hash("admin123")
    admin_user = {
        "email": "admin@parkeasy.com",
        "full_name": "Admin User",
        "phone": "+91-98765-43210",
        "password": admin_password,
        "role": "admin",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    existing_admin = await db.users.find_one({"email": admin_user["email"]})
    if not existing_admin:
        result = await db.users.insert_one(admin_user)
        admin_id = str(result.inserted_id)
        logger.info(f"✓ Admin user created: {admin_user['email']} / admin123")
    else:
        admin_id = str(existing_admin["_id"])
        logger.info(f"✓ Admin user already exists: {admin_user['email']}")
    
    # Create regular users
    users_data = [
        {
            "email": "rahul@example.com",
            "full_name": "Rahul Sharma",
            "phone": "+91-98765-43211",
            "password": get_password_hash("password123"),
            "role": "user",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "email": "priya@example.com",
            "full_name": "Priya Patel",
            "phone": "+91-98765-43212",
            "password": get_password_hash("password123"),
            "role": "user",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    user_ids = []
    for user_data in users_data:
        existing = await db.users.find_one({"email": user_data["email"]})
        if not existing:
            result = await db.users.insert_one(user_data)
            user_ids.append(str(result.inserted_id))
            logger.info(f"✓ User created: {user_data['email']} / password123")
        else:
            user_ids.append(str(existing["_id"]))
            logger.info(f"✓ User already exists: {user_data['email']}")
    
    # Create parking lots - Indian locations
    parking_lots_data = [
        {
            "name": "Connaught Place Parking",
            "address": "Connaught Place, New Delhi, Delhi 110001",
            "latitude": 28.6315,
            "longitude": 77.2167,
            "location": {"type": "Point", "coordinates": [77.2167, 28.6315]},
            "total_slots": 80,
            "available_slots": 65,
            "price_per_hour": 50.00,
            "operating_hours": "24/7",
            "amenities": ["Security", "CCTV", "Covered", "EV Charging", "Valet"],
            "image_url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800",
            "is_active": True,
            "rating": 4.5,
            "total_reviews": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Indira Gandhi Airport Parking",
            "address": "Terminal 3, IGI Airport, New Delhi, Delhi 110037",
            "latitude": 28.5562,
            "longitude": 77.1000,
            "location": {"type": "Point", "coordinates": [77.1000, 28.5562]},
            "total_slots": 150,
            "available_slots": 120,
            "price_per_hour": 100.00,
            "operating_hours": "24/7",
            "amenities": ["Security", "Shuttle Service", "Covered", "Valet", "CCTV"],
            "image_url": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800",
            "is_active": True,
            "rating": 4.8,
            "total_reviews": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Phoenix Marketcity Parking",
            "address": "LBS Marg, Kurla West, Mumbai, Maharashtra 400070",
            "latitude": 19.0822,
            "longitude": 72.8880,
            "location": {"type": "Point", "coordinates": [72.8880, 19.0822]},
            "total_slots": 200,
            "available_slots": 160,
            "price_per_hour": 40.00,
            "operating_hours": "10:00 AM - 11:00 PM",
            "amenities": ["Security", "Restrooms", "Covered", "Disabled Access", "CCTV"],
            "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            "is_active": True,
            "rating": 4.6,
            "total_reviews": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Marine Drive Parking",
            "address": "Netaji Subhash Chandra Bose Road, Mumbai, Maharashtra 400020",
            "latitude": 18.9432,
            "longitude": 72.8236,
            "location": {"type": "Point", "coordinates": [72.8236, 18.9432]},
            "total_slots": 60,
            "available_slots": 45,
            "price_per_hour": 60.00,
            "operating_hours": "6:00 AM - 11:00 PM",
            "amenities": ["Security", "Sea View", "Outdoor", "CCTV"],
            "image_url": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800",
            "is_active": True,
            "rating": 4.3,
            "total_reviews": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "MG Road Metro Parking",
            "address": "MG Road, Bengaluru, Karnataka 560001",
            "latitude": 12.9759,
            "longitude": 77.6061,
            "location": {"type": "Point", "coordinates": [77.6061, 12.9759]},
            "total_slots": 100,
            "available_slots": 75,
            "price_per_hour": 30.00,
            "operating_hours": "6:00 AM - 11:00 PM",
            "amenities": ["Security", "Metro Access", "Covered", "CCTV", "Bike Parking"],
            "image_url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800",
            "is_active": True,
            "rating": 4.4,
            "total_reviews": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Inorbit Mall Parking",
            "address": "HITEC City, Hyderabad, Telangana 500081",
            "latitude": 17.4326,
            "longitude": 78.3871,
            "location": {"type": "Point", "coordinates": [78.3871, 17.4326]},
            "total_slots": 180,
            "available_slots": 140,
            "price_per_hour": 35.00,
            "operating_hours": "10:00 AM - 10:00 PM",
            "amenities": ["Security", "Restrooms", "Covered", "Disabled Access", "CCTV", "Food Court Access"],
            "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            "is_active": True,
            "rating": 4.5,
            "total_reviews": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Kolkata Airport Parking",
            "address": "Netaji Subhas Chandra Bose International Airport, Kolkata, West Bengal 700052",
            "latitude": 22.6520,
            "longitude": 88.4463,
            "location": {"type": "Point", "coordinates": [88.4463, 22.6520]},
            "total_slots": 120,
            "available_slots": 95,
            "price_per_hour": 80.00,
            "operating_hours": "24/7",
            "amenities": ["Security", "Shuttle Service", "Covered", "CCTV", "Valet"],
            "image_url": "https://images.unsplash.com/photo-1506521781263-d8422e82f27a?w=800",
            "is_active": True,
            "rating": 4.2,
            "total_reviews": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Lulu Mall Parking",
            "address": "34/1111, NH 47, Edappally, Kochi, Kerala 682024",
            "latitude": 10.0261,
            "longitude": 76.3125,
            "location": {"type": "Point", "coordinates": [76.3125, 10.0261]},
            "total_slots": 250,
            "available_slots": 200,
            "price_per_hour": 25.00,
            "operating_hours": "9:00 AM - 11:00 PM",
            "amenities": ["Security", "Restrooms", "Covered", "Disabled Access", "CCTV", "Family Parking"],
            "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            "is_active": True,
            "rating": 4.7,
            "total_reviews": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Pune Junction Parking",
            "address": "Dr. Ambedkar Veer Savarkar Udyog Mandir, Pune, Maharashtra 411001",
            "latitude": 18.5204,
            "longitude": 73.8567,
            "location": {"type": "Point", "coordinates": [73.8567, 18.5204]},
            "total_slots": 140,
            "available_slots": 105,
            "price_per_hour": 35.00,
            "operating_hours": "24/7",
            "amenities": ["Security", "CCTV", "Covered", "Valet", "EV Charging"],
            "image_url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800",
            "is_active": True,
            "rating": 4.4,
            "total_reviews": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Ahmedabad Central Parking",
            "address": "Navrangpura, Ahmedabad, Gujarat 380009",
            "latitude": 23.0225,
            "longitude": 72.5714,
            "location": {"type": "Point", "coordinates": [72.5714, 23.0225]},
            "total_slots": 160,
            "available_slots": 130,
            "price_per_hour": 30.00,
            "operating_hours": "6:00 AM - 10:00 PM",
            "amenities": ["Security", "Restrooms", "Covered", "CCTV", "Bike Parking"],
            "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            "is_active": True,
            "rating": 4.3,
            "total_reviews": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Jaipur City Palace Parking",
            "address": "Sanganeri Gate, City Palace Road, Jaipur, Rajasthan 302001",
            "latitude": 26.9244,
            "longitude": 75.8267,
            "location": {"type": "Point", "coordinates": [75.8267, 26.9244]},
            "total_slots": 110,
            "available_slots": 85,
            "price_per_hour": 28.00,
            "operating_hours": "6:00 AM - 9:00 PM",
            "amenities": ["Security", "CCTV", "Outdoor", "Disabled Access"],
            "image_url": "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=800",
            "is_active": True,
            "rating": 4.1,
            "total_reviews": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Chandigarh High Street Parking",
            "address": "Sector 17, Chandigarh, Chandigarh 160017",
            "latitude": 30.7400,
            "longitude": 76.7883,
            "location": {"type": "Point", "coordinates": [76.7883, 30.7400]},
            "total_slots": 130,
            "available_slots": 100,
            "price_per_hour": 32.00,
            "operating_hours": "8:00 AM - 10:00 PM",
            "amenities": ["Security", "Covered", "CCTV", "Restrooms", "Family Parking"],
            "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            "is_active": True,
            "rating": 4.5,
            "total_reviews": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Lucknow Central Parking",
            "address": "Hazratganj, Lucknow, Uttar Pradesh 226001",
            "latitude": 26.8467,
            "longitude": 80.9462,
            "location": {"type": "Point", "coordinates": [80.9462, 26.8467]},
            "total_slots": 95,
            "available_slots": 70,
            "price_per_hour": 25.00,
            "operating_hours": "7:00 AM - 10:00 PM",
            "amenities": ["Security", "CCTV", "Covered", "Valet"],
            "image_url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800",
            "is_active": True,
            "rating": 4.2,
            "total_reviews": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Surat Diamond Plaza Parking",
            "address": "Varachha Road, Surat, Gujarat 395006",
            "latitude": 21.1702,
            "longitude": 72.8311,
            "location": {"type": "Point", "coordinates": [72.8311, 21.1702]},
            "total_slots": 175,
            "available_slots": 140,
            "price_per_hour": 33.00,
            "operating_hours": "9:00 AM - 11:00 PM",
            "amenities": ["Security", "Restrooms", "Covered", "CCTV", "Disabled Access", "EV Charging"],
            "image_url": "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800",
            "is_active": True,
            "rating": 4.4,
            "total_reviews": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        },
        {
            "name": "Indore Central Plaza Parking",
            "address": "MG Road, Indore, Madhya Pradesh 452001",
            "latitude": 22.7196,
            "longitude": 75.8577,
            "location": {"type": "Point", "coordinates": [75.8577, 22.7196]},
            "total_slots": 120,
            "available_slots": 90,
            "price_per_hour": 27.00,
            "operating_hours": "7:00 AM - 10:00 PM",
            "amenities": ["Security", "CCTV", "Covered", "Restrooms"],
            "image_url": "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=800",
            "is_active": True,
            "rating": 4.3,
            "total_reviews": 0,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
    ]
    
    lot_ids = []
    for lot_data in parking_lots_data:
        existing = await db.parking_lots.find_one({"name": lot_data["name"]})
        if not existing:
            result = await db.parking_lots.insert_one(lot_data)
            lot_id = str(result.inserted_id)
            lot_ids.append(lot_id)
            logger.info(f"✓ Parking lot created: {lot_data['name']}")
            
            # Create parking slots for this lot
            slots = []
            for i in range(1, lot_data["total_slots"] + 1):
                slot_type = "regular"
                if i % 20 == 0:
                    slot_type = "disabled"
                elif i % 15 == 0:
                    slot_type = "electric"
                elif i % 10 == 0:
                    slot_type = "compact"
                
                status = "available"
                if i <= (lot_data["total_slots"] - lot_data["available_slots"]):
                    status = "occupied"
                
                floor = (i - 1) // 25 + 1
                
                slot = {
                    "lot_id": lot_id,
                    "slot_number": f"A{i:03d}",
                    "slot_type": slot_type,
                    "status": status,
                    "floor_level": floor,
                    "created_at": datetime.utcnow(),
                    "updated_at": datetime.utcnow()
                }
                slots.append(slot)
            
            if slots:
                await db.parking_slots.insert_many(slots)
                logger.info(f"  ✓ Created {len(slots)} parking slots")
        else:
            lot_ids.append(str(existing["_id"]))
            logger.info(f"✓ Parking lot already exists: {lot_data['name']}")
    
    # Create vehicles for users - Indian registration numbers
    if user_ids:
        vehicles_data = [
            {
                "user_id": user_ids[0],
                "license_plate": "MH-12-AB-1234",
                "make": "Maruti Suzuki",
                "model": "Swift",
                "color": "Blue",
                "vehicle_type": "car",
                "created_at": datetime.utcnow()
            },
            {
                "user_id": user_ids[0],
                "license_plate": "DL-01-CA-5678",
                "make": "Hyundai",
                "model": "Creta",
                "color": "Red",
                "vehicle_type": "car",
                "created_at": datetime.utcnow()
            }
        ]
        
        if len(user_ids) > 1:
            vehicles_data.append({
                "user_id": user_ids[1],
                "license_plate": "KA-05-MH-9999",
                "make": "Tata",
                "model": "Nexon EV",
                "color": "White",
                "vehicle_type": "car",
                "created_at": datetime.utcnow()
            })
        
        for vehicle_data in vehicles_data:
            existing = await db.vehicles.find_one({"license_plate": vehicle_data["license_plate"]})
            if not existing:
                await db.vehicles.insert_one(vehicle_data)
                logger.info(f"✓ Vehicle created: {vehicle_data['license_plate']}")
            else:
                logger.info(f"✓ Vehicle already exists: {vehicle_data['license_plate']}")
    
    logger.info("\n" + "="*50)
    logger.info("Database seeding completed successfully!")
    logger.info("="*50)
    logger.info("\nTest Accounts:")
    logger.info("  Admin: admin@parkeasy.com / admin123")
    logger.info("  User 1: rahul@example.com / password123")
    logger.info("  User 2: priya@example.com / password123")
    logger.info("\nYou can now start using the application!")
    logger.info("="*50 + "\n")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(seed_database())
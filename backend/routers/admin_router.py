"""
Admin-specific routes for user management, slot management, and real-time statistics.
"""
from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional
from datetime import datetime
from bson import ObjectId

from auth import get_current_admin
from database import get_database
from models import TokenData, UserRole, UserCreate, UserUpdate, ParkingSlotCreate, ParkingSlotUpdate

router = APIRouter(prefix="/api/admin", tags=["admin"])


# ==================== USER MANAGEMENT ====================

@router.get("/users")
async def get_all_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    role: Optional[str] = None,
    search: Optional[str] = None,
    current_user: TokenData = Depends(get_current_admin)
):
    """Get all users with pagination and filtering."""
    db = await get_database()
    
    # Build query
    query = {}
    if role:
        query["role"] = role
    if search:
        query["$or"] = [
            {"email": {"$regex": search, "$options": "i"}},
            {"full_name": {"$regex": search, "$options": "i"}},
            {"phone": {"$regex": search, "$options": "i"}}
        ]
    
    # Get total count
    total = await db.users.count_documents(query)
    
    # Get users
    cursor = db.users.find(query).skip(skip).limit(limit).sort("created_at", -1)
    users = await cursor.to_list(length=limit)
    
    # Format response
    formatted_users = []
    for user in users:
        formatted_users.append({
            "id": str(user["_id"]),
            "email": user["email"],
            "full_name": user["full_name"],
            "phone": user.get("phone"),
            "role": user["role"],
            "created_at": user["created_at"].isoformat(),
            "updated_at": user.get("updated_at", user["created_at"]).isoformat()
        })
    
    return {
        "users": formatted_users,
        "total": total,
        "skip": skip,
        "limit": limit
    }


@router.get("/users/{user_id}")
async def get_user_details(
    user_id: str,
    current_user: TokenData = Depends(get_current_admin)
):
    """Get detailed information about a specific user."""
    db = await get_database()
    
    # Get user
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's bookings count
    total_bookings = await db.bookings.count_documents({"user_id": user_id})
    active_bookings = await db.bookings.count_documents({
        "user_id": user_id,
        "status": {"$in": ["confirmed", "active"]}
    })
    
    # Get user's total spent
    pipeline = [
        {"$match": {"user_id": user_id, "payment_status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$total_price"}}}
    ]
    result = await db.bookings.aggregate(pipeline).to_list(length=1)
    total_spent = result[0]["total"] if result else 0
    
    # Get user's vehicles
    vehicles = await db.vehicles.find({"user_id": user_id}).to_list(length=100)
    
    return {
        "id": str(user["_id"]),
        "email": user["email"],
        "full_name": user["full_name"],
        "phone": user.get("phone"),
        "role": user["role"],
        "created_at": user["created_at"].isoformat(),
        "updated_at": user.get("updated_at", user["created_at"]).isoformat(),
        "stats": {
            "total_bookings": total_bookings,
            "active_bookings": active_bookings,
            "total_spent": total_spent,
            "total_vehicles": len(vehicles)
        },
        "vehicles": [
            {
                "id": str(v["_id"]),
                "license_plate": v["license_plate"],
                "make": v["make"],
                "model": v["model"],
                "vehicle_type": v["vehicle_type"]
            }
            for v in vehicles
        ]
    }


@router.post("/users")
async def create_user_by_admin(
    user_data: UserCreate,
    current_user: TokenData = Depends(get_current_admin)
):
    """Create a new user (admin only)."""
    from auth import get_password_hash
    
    db = await get_database()
    
    # Check if user already exists
    existing = await db.users.find_one({"email": user_data.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create user document
    user_doc = {
        "email": user_data.email,
        "full_name": user_data.full_name,
        "phone": user_data.phone,
        "password": get_password_hash(user_data.password),
        "role": user_data.role or "user",
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_doc)
    
    return {
        "id": str(result.inserted_id),
        "email": user_doc["email"],
        "full_name": user_doc["full_name"],
        "phone": user_doc["phone"],
        "role": user_doc["role"],
        "created_at": user_doc["created_at"].isoformat()
    }


@router.put("/users/{user_id}")
async def update_user_by_admin(
    user_id: str,
    user_data: UserUpdate,
    current_user: TokenData = Depends(get_current_admin)
):
    """Update user information (admin only)."""
    from auth import get_password_hash
    
    db = await get_database()
    
    # Check if user exists
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Build update document
    update_doc = {"updated_at": datetime.utcnow()}
    
    if user_data.full_name is not None:
        update_doc["full_name"] = user_data.full_name
    if user_data.phone is not None:
        update_doc["phone"] = user_data.phone
    if user_data.role is not None:
        update_doc["role"] = user_data.role
    if user_data.password is not None:
        update_doc["password"] = get_password_hash(user_data.password)
    
    # Update user
    await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_doc}
    )
    
    # Get updated user
    updated_user = await db.users.find_one({"_id": ObjectId(user_id)})
    
    return {
        "id": str(updated_user["_id"]),
        "email": updated_user["email"],
        "full_name": updated_user["full_name"],
        "phone": updated_user.get("phone"),
        "role": updated_user["role"],
        "updated_at": updated_user["updated_at"].isoformat()
    }


@router.delete("/users/{user_id}")
async def delete_user(
    user_id: str,
    current_user: TokenData = Depends(get_current_admin)
):
    """Delete a user (admin only)."""
    db = await get_database()
    
    # Check if user exists
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent deleting yourself
    if user_id == current_user.user_id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    # Delete user's data
    await db.vehicles.delete_many({"user_id": user_id})
    await db.reviews.delete_many({"user_id": user_id})
    # Note: Keep bookings for historical records, just mark them
    await db.bookings.update_many(
        {"user_id": user_id},
        {"$set": {"user_deleted": True}}
    )
    
    # Delete user
    await db.users.delete_one({"_id": ObjectId(user_id)})
    
    return {"message": "User deleted successfully"}


# ==================== SLOT MANAGEMENT ====================

@router.post("/parking-lots/{lot_id}/slots")
async def create_parking_slot(
    lot_id: str,
    slot_data: ParkingSlotCreate,
    current_user: TokenData = Depends(get_current_admin)
):
    """Create a new parking slot for a lot."""
    db = await get_database()
    
    # Check if lot exists
    lot = await db.parking_lots.find_one({"_id": ObjectId(lot_id)})
    if not lot:
        raise HTTPException(status_code=404, detail="Parking lot not found")
    
    # Check if slot number already exists
    existing = await db.parking_slots.find_one({
        "lot_id": lot_id,
        "slot_number": slot_data.slot_number
    })
    if existing:
        raise HTTPException(status_code=400, detail="Slot number already exists")
    
    # Create slot
    slot_doc = {
        "lot_id": lot_id,
        "slot_number": slot_data.slot_number,
        "slot_type": slot_data.slot_type,
        "status": slot_data.status or "available",
        "floor_level": slot_data.floor_level,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.parking_slots.insert_one(slot_doc)
    
    # Update lot's total slots
    await db.parking_lots.update_one(
        {"_id": ObjectId(lot_id)},
        {"$inc": {"total_slots": 1, "available_slots": 1 if slot_data.status == "available" else 0}}
    )
    
    return {
        "id": str(result.inserted_id),
        "lot_id": lot_id,
        "slot_number": slot_doc["slot_number"],
        "slot_type": slot_doc["slot_type"],
        "status": slot_doc["status"],
        "floor_level": slot_doc["floor_level"],
        "created_at": slot_doc["created_at"].isoformat()
    }


@router.post("/parking-lots/{lot_id}/slots/bulk")
async def create_bulk_parking_slots(
    lot_id: str,
    start_number: int = Query(..., ge=1),
    count: int = Query(..., ge=1, le=100),
    slot_type: str = Query("regular"),
    floor_level: int = Query(1, ge=1),
    current_user: TokenData = Depends(get_current_admin)
):
    """Create multiple parking slots at once."""
    db = await get_database()
    
    # Check if lot exists
    lot = await db.parking_lots.find_one({"_id": ObjectId(lot_id)})
    if not lot:
        raise HTTPException(status_code=404, detail="Parking lot not found")
    
    # Create slots
    slots = []
    for i in range(count):
        slot_number = f"A{start_number + i:03d}"
        
        # Check if slot already exists
        existing = await db.parking_slots.find_one({
            "lot_id": lot_id,
            "slot_number": slot_number
        })
        if existing:
            continue
        
        slots.append({
            "lot_id": lot_id,
            "slot_number": slot_number,
            "slot_type": slot_type,
            "status": "available",
            "floor_level": floor_level,
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        })
    
    if slots:
        await db.parking_slots.insert_many(slots)
        
        # Update lot's total slots
        await db.parking_lots.update_one(
            {"_id": ObjectId(lot_id)},
            {"$inc": {"total_slots": len(slots), "available_slots": len(slots)}}
        )
    
    return {
        "message": f"Created {len(slots)} parking slots",
        "created_count": len(slots),
        "skipped_count": count - len(slots)
    }


@router.put("/parking-slots/{slot_id}")
async def update_parking_slot(
    slot_id: str,
    slot_data: ParkingSlotUpdate,
    current_user: TokenData = Depends(get_current_admin)
):
    """Update a parking slot."""
    db = await get_database()
    
    # Check if slot exists
    slot = await db.parking_slots.find_one({"_id": ObjectId(slot_id)})
    if not slot:
        raise HTTPException(status_code=404, detail="Parking slot not found")
    
    old_status = slot["status"]
    
    # Build update document
    update_doc = {"updated_at": datetime.utcnow()}
    
    if slot_data.slot_type is not None:
        update_doc["slot_type"] = slot_data.slot_type
    if slot_data.status is not None:
        update_doc["status"] = slot_data.status
    if slot_data.floor_level is not None:
        update_doc["floor_level"] = slot_data.floor_level
    
    # Update slot
    await db.parking_slots.update_one(
        {"_id": ObjectId(slot_id)},
        {"$set": update_doc}
    )
    
    # Update lot's available slots if status changed
    if slot_data.status and slot_data.status != old_status:
        increment = 0
        if old_status == "available" and slot_data.status != "available":
            increment = -1
        elif old_status != "available" and slot_data.status == "available":
            increment = 1
        
        if increment != 0:
            await db.parking_lots.update_one(
                {"_id": ObjectId(slot["lot_id"])},
                {"$inc": {"available_slots": increment}}
            )
    
    # Get updated slot
    updated_slot = await db.parking_slots.find_one({"_id": ObjectId(slot_id)})
    
    return {
        "id": str(updated_slot["_id"]),
        "lot_id": updated_slot["lot_id"],
        "slot_number": updated_slot["slot_number"],
        "slot_type": updated_slot["slot_type"],
        "status": updated_slot["status"],
        "floor_level": updated_slot["floor_level"],
        "updated_at": updated_slot["updated_at"].isoformat()
    }


@router.delete("/parking-slots/{slot_id}")
async def delete_parking_slot(
    slot_id: str,
    current_user: TokenData = Depends(get_current_admin)
):
    """Delete a parking slot."""
    db = await get_database()
    
    # Check if slot exists
    slot = await db.parking_slots.find_one({"_id": ObjectId(slot_id)})
    if not slot:
        raise HTTPException(status_code=404, detail="Parking slot not found")
    
    # Check if slot is currently booked
    active_booking = await db.bookings.find_one({
        "slot_id": slot_id,
        "status": {"$in": ["confirmed", "active"]}
    })
    if active_booking:
        raise HTTPException(status_code=400, detail="Cannot delete slot with active booking")
    
    # Delete slot
    await db.parking_slots.delete_one({"_id": ObjectId(slot_id)})
    
    # Update lot's total slots
    decrement_available = 1 if slot["status"] == "available" else 0
    await db.parking_lots.update_one(
        {"_id": ObjectId(slot["lot_id"])},
        {"$inc": {"total_slots": -1, "available_slots": -decrement_available}}
    )
    
    return {"message": "Parking slot deleted successfully"}


# ==================== REAL-TIME STATISTICS ====================

@router.get("/stats/realtime")
async def get_realtime_stats(
    current_user: TokenData = Depends(get_current_admin)
):
    """Get real-time statistics for admin dashboard."""
    db = await get_database()
    
    # Total users
    total_users = await db.users.count_documents({"role": "user"})
    
    # New users today
    from datetime import datetime, timedelta
    today_start = datetime.utcnow().replace(hour=0, minute=0, second=0, microsecond=0)
    new_users_today = await db.users.count_documents({
        "role": "user",
        "created_at": {"$gte": today_start}
    })
    
    # Total parking lots
    total_lots = await db.parking_lots.count_documents({})
    active_lots = await db.parking_lots.count_documents({"is_active": True})
    
    # Total slots
    total_slots = await db.parking_slots.count_documents({})
    available_slots = await db.parking_slots.count_documents({"status": "available"})
    occupied_slots = await db.parking_slots.count_documents({"status": "occupied"})
    
    # Bookings
    total_bookings = await db.bookings.count_documents({})
    active_bookings = await db.bookings.count_documents({
        "status": {"$in": ["confirmed", "active"]}
    })
    completed_bookings = await db.bookings.count_documents({"status": "completed"})
    
    # Today's bookings
    bookings_today = await db.bookings.count_documents({
        "created_at": {"$gte": today_start}
    })
    
    # Revenue
    revenue_pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$total_price"}}}
    ]
    revenue_result = await db.bookings.aggregate(revenue_pipeline).to_list(length=1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0
    
    # Today's revenue
    today_revenue_pipeline = [
        {"$match": {"payment_status": "paid", "created_at": {"$gte": today_start}}},
        {"$group": {"_id": None, "total": {"$sum": "$total_price"}}}
    ]
    today_revenue_result = await db.bookings.aggregate(today_revenue_pipeline).to_list(length=1)
    today_revenue = today_revenue_result[0]["total"] if today_revenue_result else 0
    
    # Occupancy rate
    occupancy_rate = (occupied_slots / total_slots * 100) if total_slots > 0 else 0
    
    # Recent activities (last 10 bookings)
    recent_bookings = await db.bookings.find().sort("created_at", -1).limit(10).to_list(length=10)
    
    activities = []
    for booking in recent_bookings:
        user = await db.users.find_one({"_id": ObjectId(booking["user_id"])})
        lot = await db.parking_lots.find_one({"_id": ObjectId(booking["lot_id"])})
        
        activities.append({
            "id": str(booking["_id"]),
            "user_name": user["full_name"] if user else "Unknown",
            "lot_name": lot["name"] if lot else "Unknown",
            "status": booking["status"],
            "total_price": booking["total_price"],
            "created_at": booking["created_at"].isoformat()
        })
    
    return {
        "users": {
            "total": total_users,
            "new_today": new_users_today
        },
        "parking_lots": {
            "total": total_lots,
            "active": active_lots
        },
        "slots": {
            "total": total_slots,
            "available": available_slots,
            "occupied": occupied_slots,
            "occupancy_rate": round(occupancy_rate, 2)
        },
        "bookings": {
            "total": total_bookings,
            "active": active_bookings,
            "completed": completed_bookings,
            "today": bookings_today
        },
        "revenue": {
            "total": total_revenue,
            "today": today_revenue
        },
        "recent_activities": activities,
        "last_updated": datetime.utcnow().isoformat()
    }
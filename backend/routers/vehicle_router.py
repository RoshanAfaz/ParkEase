"""
Vehicle management routes.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from bson import ObjectId
from datetime import datetime
from database import get_database
from models import VehicleCreate, VehicleResponse
from auth import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/vehicles", tags=["Vehicles"])


@router.post("", response_model=VehicleResponse, status_code=status.HTTP_201_CREATED)
async def create_vehicle(
    vehicle_data: VehicleCreate,
    current_user = Depends(get_current_user)
):
    """Add a new vehicle for the current user."""
    db = get_database()
    
    # Check if license plate already exists
    existing = await db.vehicles.find_one({"license_plate": vehicle_data.license_plate})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Vehicle with this license plate already exists"
        )
    
    # Create vehicle document
    vehicle_doc = {
        **vehicle_data.dict(),
        "user_id": current_user.user_id,
        "created_at": datetime.utcnow()
    }
    
    result = await db.vehicles.insert_one(vehicle_doc)
    vehicle_id = str(result.inserted_id)
    
    logger.info(f"Vehicle created: {vehicle_data.license_plate} for user {current_user.user_id}")
    
    return VehicleResponse(
        id=vehicle_id,
        user_id=current_user.user_id,
        **vehicle_data.dict(),
        created_at=vehicle_doc["created_at"]
    )


@router.get("", response_model=List[VehicleResponse])
async def get_user_vehicles(current_user = Depends(get_current_user)):
    """Get all vehicles for the current user."""
    db = get_database()
    
    cursor = db.vehicles.find({"user_id": current_user.user_id})
    vehicles = await cursor.to_list(length=None)
    
    return [
        VehicleResponse(
            id=str(vehicle["_id"]),
            user_id=vehicle["user_id"],
            license_plate=vehicle["license_plate"],
            make=vehicle["make"],
            model=vehicle["model"],
            color=vehicle.get("color"),
            vehicle_type=vehicle["vehicle_type"],
            created_at=vehicle["created_at"]
        )
        for vehicle in vehicles
    ]


@router.get("/{vehicle_id}", response_model=VehicleResponse)
async def get_vehicle(
    vehicle_id: str,
    current_user = Depends(get_current_user)
):
    """Get a specific vehicle by ID."""
    db = get_database()
    
    try:
        vehicle = await db.vehicles.find_one({
            "_id": ObjectId(vehicle_id),
            "user_id": current_user.user_id
        })
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid vehicle ID"
        )
    
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    return VehicleResponse(
        id=str(vehicle["_id"]),
        user_id=vehicle["user_id"],
        license_plate=vehicle["license_plate"],
        make=vehicle["make"],
        model=vehicle["model"],
        color=vehicle.get("color"),
        vehicle_type=vehicle["vehicle_type"],
        created_at=vehicle["created_at"]
    )


@router.delete("/{vehicle_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_vehicle(
    vehicle_id: str,
    current_user = Depends(get_current_user)
):
    """Delete a vehicle."""
    db = get_database()
    
    # Check if vehicle has active bookings
    active_bookings = await db.bookings.count_documents({
        "vehicle_id": vehicle_id,
        "status": {"$in": ["pending", "confirmed", "active"]}
    })
    
    if active_bookings > 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot delete vehicle with active bookings"
        )
    
    try:
        result = await db.vehicles.delete_one({
            "_id": ObjectId(vehicle_id),
            "user_id": current_user.user_id
        })
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid vehicle ID"
        )
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    logger.info(f"Vehicle deleted: {vehicle_id}")
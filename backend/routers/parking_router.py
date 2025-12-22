"""
Parking lot and slot management routes.
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
from database import get_database
from models import (
    ParkingLotCreate,
    ParkingLotResponse,
    ParkingLotUpdate,
    ParkingSlotResponse,
    ParkingSearchQuery,
    SlotStatus
)
from auth import get_current_user, get_current_admin
from utils import calculate_distance
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/parking", tags=["Parking"])


@router.post("/lots", response_model=ParkingLotResponse, status_code=status.HTTP_201_CREATED)
async def create_parking_lot(
    lot_data: ParkingLotCreate,
    current_user = Depends(get_current_admin)
):
    """Create a new parking lot (Admin only)."""
    db = get_database()
    
    # Create parking lot document
    lot_doc = {
        **lot_data.dict(exclude={"slots"}),
        "location": {
            "type": "Point",
            "coordinates": [lot_data.longitude, lot_data.latitude]
        },
        "available_slots": lot_data.total_slots,
        "is_active": True,
        "rating": None,
        "total_reviews": 0,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.parking_lots.insert_one(lot_doc)
    lot_id = str(result.inserted_id)
    
    # Create parking slots
    if lot_data.slots:
        slots_docs = []
        for slot in lot_data.slots:
            slot_doc = {
                **slot.dict(),
                "lot_id": lot_id,
                "created_at": datetime.utcnow(),
                "updated_at": datetime.utcnow()
            }
            slots_docs.append(slot_doc)
        
        if slots_docs:
            await db.parking_slots.insert_many(slots_docs)
    
    logger.info(f"Parking lot created: {lot_data.name}")
    
    return ParkingLotResponse(
        id=lot_id,
        **lot_data.dict(exclude={"slots"}),
        available_slots=lot_data.total_slots,
        is_active=True,
        created_at=lot_doc["created_at"]
    )


@router.get("/lots", response_model=List[ParkingLotResponse])
async def get_parking_lots(
    latitude: Optional[float] = Query(None),
    longitude: Optional[float] = Query(None),
    max_distance: float = Query(10.0, description="Maximum distance in km"),
    is_active: bool = Query(True),
    current_user = Depends(get_current_user)
):
    """Get all parking lots with optional location-based filtering."""
    db = get_database()
    
    query = {"is_active": is_active}
    
    # Get all parking lots
    cursor = db.parking_lots.find(query)
    lots = await cursor.to_list(length=None)
    
    result = []
    for lot in lots:
        lot_response = ParkingLotResponse(
            id=str(lot["_id"]),
            name=lot["name"],
            address=lot["address"],
            latitude=lot["latitude"],
            longitude=lot["longitude"],
            total_slots=lot["total_slots"],
            available_slots=lot["available_slots"],
            price_per_hour=lot["price_per_hour"],
            operating_hours=lot["operating_hours"],
            amenities=lot.get("amenities", []),
            image_url=lot.get("image_url"),
            is_active=lot["is_active"],
            rating=lot.get("rating"),
            total_reviews=lot.get("total_reviews", 0),
            created_at=lot["created_at"]
        )
        
        # Filter by distance if coordinates provided
        if latitude is not None and longitude is not None:
            distance = calculate_distance(
                latitude, longitude,
                lot["latitude"], lot["longitude"]
            )
            if distance <= max_distance:
                result.append(lot_response)
        else:
            result.append(lot_response)
    
    return result


@router.get("/lots/{lot_id}", response_model=ParkingLotResponse)
async def get_parking_lot(
    lot_id: str,
    current_user = Depends(get_current_user)
):
    """Get a specific parking lot by ID."""
    db = get_database()
    
    try:
        lot = await db.parking_lots.find_one({"_id": ObjectId(lot_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lot ID"
        )
    
    if not lot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking lot not found"
        )
    
    return ParkingLotResponse(
        id=str(lot["_id"]),
        name=lot["name"],
        address=lot["address"],
        latitude=lot["latitude"],
        longitude=lot["longitude"],
        total_slots=lot["total_slots"],
        available_slots=lot["available_slots"],
        price_per_hour=lot["price_per_hour"],
        operating_hours=lot["operating_hours"],
        amenities=lot.get("amenities", []),
        image_url=lot.get("image_url"),
        is_active=lot["is_active"],
        rating=lot.get("rating"),
        total_reviews=lot.get("total_reviews", 0),
        created_at=lot["created_at"]
    )


@router.put("/lots/{lot_id}", response_model=ParkingLotResponse)
async def update_parking_lot(
    lot_id: str,
    update_data: ParkingLotUpdate,
    current_user = Depends(get_current_admin)
):
    """Update a parking lot (Admin only)."""
    db = get_database()
    
    # Prepare update data
    update_dict = {k: v for k, v in update_data.dict(exclude_unset=True).items()}
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    # Update location if coordinates changed
    if "latitude" in update_dict or "longitude" in update_dict:
        lot = await db.parking_lots.find_one({"_id": ObjectId(lot_id)})
        if lot:
            lat = update_dict.get("latitude", lot["latitude"])
            lon = update_dict.get("longitude", lot["longitude"])
            update_dict["location"] = {
                "type": "Point",
                "coordinates": [lon, lat]
            }
    
    update_dict["updated_at"] = datetime.utcnow()
    
    try:
        result = await db.parking_lots.find_one_and_update(
            {"_id": ObjectId(lot_id)},
            {"$set": update_dict},
            return_document=True
        )
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lot ID"
        )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking lot not found"
        )
    
    logger.info(f"Parking lot updated: {lot_id}")
    
    return ParkingLotResponse(
        id=str(result["_id"]),
        name=result["name"],
        address=result["address"],
        latitude=result["latitude"],
        longitude=result["longitude"],
        total_slots=result["total_slots"],
        available_slots=result["available_slots"],
        price_per_hour=result["price_per_hour"],
        operating_hours=result["operating_hours"],
        amenities=result.get("amenities", []),
        image_url=result.get("image_url"),
        is_active=result["is_active"],
        rating=result.get("rating"),
        total_reviews=result.get("total_reviews", 0),
        created_at=result["created_at"]
    )


@router.delete("/lots/{lot_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_parking_lot(
    lot_id: str,
    current_user = Depends(get_current_admin)
):
    """Delete a parking lot (Admin only)."""
    db = get_database()
    
    try:
        result = await db.parking_lots.delete_one({"_id": ObjectId(lot_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lot ID"
        )
    
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking lot not found"
        )
    
    # Delete associated slots
    await db.parking_slots.delete_many({"lot_id": lot_id})
    
    logger.info(f"Parking lot deleted: {lot_id}")


@router.get("/lots/{lot_id}/slots", response_model=List[ParkingSlotResponse])
async def get_parking_slots(
    lot_id: str,
    status: Optional[SlotStatus] = Query(None),
    current_user = Depends(get_current_user)
):
    """Get all slots for a parking lot."""
    db = get_database()
    
    query = {"lot_id": lot_id}
    if status:
        query["status"] = status
    
    cursor = db.parking_slots.find(query)
    slots = await cursor.to_list(length=None)
    
    return [
        ParkingSlotResponse(
            id=str(slot["_id"]),
            lot_id=slot["lot_id"],
            slot_number=slot["slot_number"],
            slot_type=slot["slot_type"],
            status=slot["status"],
            floor_level=slot["floor_level"],
            created_at=slot["created_at"]
        )
        for slot in slots
    ]
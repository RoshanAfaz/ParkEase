"""
Booking management routes with QR code generation and email notifications.
"""
from asyncio import gather

from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List, Optional
from bson import ObjectId
from datetime import datetime
import logging

from pymongo import ReturnDocument
from database import get_database
from models import (
    BookingCreate,
    BookingResponse,
    BookingUpdate,
    BookingWithDetails,
    BookingStatus,
    PaymentStatus,
    SlotStatus,
    ParkingLotResponse,
    VehicleResponse,
    BookingReceipt,
    ReceiptSlotInfo,
    ReceiptVehicleInfo
)
from auth import get_current_user, get_current_admin
from utils import (
    generate_qr_code,
    send_booking_confirmation_email,
    calculate_parking_price,
    build_receipt_pdf,
    ReceiptPDFResult,
    build_receipt_payload
)


async def _maybe_build_receipt(
    *,
    booking: dict,
    lot: Optional[dict],
    slot: Optional[dict],
    vehicle: Optional[dict],
    user: Optional[dict]
) -> Optional[BookingReceipt]:
    """Try constructing a receipt payload, falling back to stored copy."""
    if not (lot and slot and vehicle and user):
        return booking.get("receipt")

    try:
        return build_receipt_payload(
            booking_id=str(booking["_id"]),
            user=user,
            lot=lot,
            slot=slot,
            vehicle=vehicle,
            start_time=booking["start_time"],
            end_time=booking["end_time"],
            booking_status=booking.get("status", BookingStatus.PENDING),
            payment_status=booking.get("payment_status", PaymentStatus.PENDING),
            total_price=booking["total_price"],
            created_at=booking.get("created_at", datetime.utcnow()),
            qr_code=booking.get("qr_code")
        )
    except Exception as err:
        logger.error(f"Failed to build booking receipt payload: {err}")
        return booking.get("receipt")

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/bookings", tags=["Bookings"])


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED)
async def create_booking(
    booking_data: BookingCreate,
    current_user = Depends(get_current_user)
):
    """Create a new parking booking."""
    db = get_database()
    
    # Verify parking lot exists
    try:
        lot = await db.parking_lots.find_one({"_id": ObjectId(booking_data.lot_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid lot ID"
        )
    
    if not lot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking lot not found"
        )
    
    # Verify slot exists and is available
    try:
        slot = await db.parking_slots.find_one({"_id": ObjectId(booking_data.slot_id)})
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid slot ID"
        )
    
    if not slot:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Parking slot not found"
        )
    
    if slot["status"] != SlotStatus.AVAILABLE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Parking slot is not available"
        )
    
    # Verify vehicle exists and belongs to user
    try:
        vehicle = await db.vehicles.find_one({
            "_id": ObjectId(booking_data.vehicle_id),
            "user_id": current_user.user_id
        })
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid vehicle ID"
        )
    
    if not vehicle:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vehicle not found"
        )
    
    # Calculate total price
    total_price = calculate_parking_price(
        lot["price_per_hour"],
        booking_data.start_time,
        booking_data.end_time
    )
    
    # Create booking document
    booking_doc = {
        "user_id": current_user.user_id,
        "lot_id": booking_data.lot_id,
        "slot_id": booking_data.slot_id,
        "vehicle_id": booking_data.vehicle_id,
        "start_time": booking_data.start_time,
        "end_time": booking_data.end_time,
        "status": BookingStatus.PENDING,
        "total_price": total_price,
        "payment_status": PaymentStatus.PENDING,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.bookings.insert_one(booking_doc)
    booking_id = str(result.inserted_id)
    
    # Generate QR code
    qr_data = f"BOOKING:{booking_id}:{current_user.user_id}"
    qr_code = generate_qr_code(qr_data)
    
    # Update booking with QR code
    await db.bookings.update_one(
        {"_id": ObjectId(booking_id)},
        {"$set": {"qr_code": qr_code}}
    )
    
    # Update slot status to reserved
    await db.parking_slots.update_one(
        {"_id": ObjectId(booking_data.slot_id)},
        {"$set": {"status": SlotStatus.RESERVED, "updated_at": datetime.utcnow()}}
    )
    
    # Update available slots count
    await db.parking_lots.update_one(
        {"_id": ObjectId(booking_data.lot_id)},
        {"$inc": {"available_slots": -1}, "$set": {"updated_at": datetime.utcnow()}}
    )
    
    # Get user info for email
    user = await db.users.find_one({"_id": ObjectId(current_user.user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    receipt_payload: Optional[BookingReceipt] = None
    try:
        receipt_payload = build_receipt_payload(
            booking_id=booking_id,
            user=user,
            lot=lot,
            slot=slot,
            vehicle=vehicle,
            start_time=booking_data.start_time,
            end_time=booking_data.end_time,
            booking_status=BookingStatus.PENDING,
            payment_status=PaymentStatus.PENDING,
            total_price=total_price,
            created_at=booking_doc["created_at"],
            qr_code=qr_code
        )
    except Exception as e:
        logger.error(f"Failed to build receipt payload: {e}")
        receipt_payload = None
    
    pdf_receipt: Optional[ReceiptPDFResult] = None
    if receipt_payload:
        try:
            pdf_receipt = build_receipt_pdf(receipt_payload)
        except Exception as err:
            logger.error(f"Failed to generate receipt PDF: {err}")

    # Send confirmation email (async, don't wait)
    try:
        await send_booking_confirmation_email(
            to_email=user["email"],
            user_name=user.get("full_name", ""),
            booking_id=booking_id,
            parking_lot_name=lot.get("name", ""),
            start_time=booking_data.start_time.strftime("%Y-%m-%d %H:%M"),
            end_time=booking_data.end_time.strftime("%Y-%m-%d %H:%M"),
            total_price=total_price,
            qr_code=qr_code,
            receipt=receipt_payload,
            pdf_receipt=pdf_receipt
        )
    except Exception as e:
        logger.error(f"Failed to send confirmation email: {e}")
    
    logger.info(f"Booking created: {booking_id} by user {current_user.user_id}")
    
    return BookingResponse(
        id=booking_id,
        user_id=current_user.user_id,
        lot_id=booking_data.lot_id,
        slot_id=booking_data.slot_id,
        vehicle_id=booking_data.vehicle_id,
        start_time=booking_data.start_time,
        end_time=booking_data.end_time,
        status=BookingStatus.PENDING,
        total_price=total_price,
        payment_status=PaymentStatus.PENDING,
        qr_code=qr_code,
        created_at=booking_doc["created_at"],
        updated_at=booking_doc["updated_at"],
        receipt=receipt_payload
    )


@router.get("", response_model=List[BookingWithDetails])
async def get_user_bookings(
    status: Optional[BookingStatus] = Query(None),
    current_user = Depends(get_current_user)
):
    """Get all bookings for the current user."""
    db = get_database()

    query = {"user_id": current_user.user_id}
    if status:
        query["status"] = status

    cursor = db.bookings.find(query).sort("created_at", -1)
    bookings = await cursor.to_list(length=None)

    result = []
    for booking in bookings:
        lot_task = db.parking_lots.find_one({"_id": ObjectId(booking["lot_id"])});
        slot_task = db.parking_slots.find_one({"_id": ObjectId(booking["slot_id"])});
        vehicle_task = db.vehicles.find_one({"_id": ObjectId(booking["vehicle_id"])});
        user_task = db.users.find_one({"_id": ObjectId(booking["user_id"])});

        lot, slot, vehicle, user_doc = await gather(
            lot_task,
            slot_task,
            vehicle_task,
            user_task,
        )

        lot_response = None
        if lot:
            lot_response = ParkingLotResponse(
                id=str(lot["_id"]),
                name=lot["name"],
                address=lot["address"],
                latitude=lot["latitude"],
                longitude=lot["longitude"],
                total_slots=lot["total_slots"],
                available_slots=lot.get("available_slots", 0),
                price_per_hour=lot["price_per_hour"],
                operating_hours=lot["operating_hours"],
                amenities=lot.get("amenities", []),
                image_url=lot.get("image_url"),
                is_active=lot["is_active"],
                rating=lot.get("rating"),
                total_reviews=lot.get("total_reviews", 0),
                created_at=lot["created_at"]
            )

        vehicle_response = None
        if vehicle:
            vehicle_response = VehicleResponse(
                id=str(vehicle["_id"]),
                user_id=vehicle["user_id"],
                license_plate=vehicle["license_plate"]
,
                make=vehicle["make"],
                model=vehicle["model"],
                color=vehicle.get("color"),
                vehicle_type=vehicle["vehicle_type"],
                created_at=vehicle["created_at"]
            )

        receipt_payload = await _maybe_build_receipt(
            booking=booking,
            lot=lot,
            slot=slot,
            vehicle=vehicle,
            user=user_doc,
        )

        result.append(BookingWithDetails(
            id=str(booking["_id"]),
            user_id=booking["user_id"],
            lot_id=booking["lot_id"],
            slot_id=booking["slot_id"],
            vehicle_id=booking["vehicle_id"],
            start_time=booking["start_time"],
            end_time=booking["end_time"],
            status=booking["status"],
            total_price=booking["total_price"],
            payment_status=booking["payment_status"],
            qr_code=booking.get("qr_code"),
            created_at=booking["created_at"],
            updated_at=booking["updated_at"],
            parking_lot=lot_response,
            vehicle=vehicle_response,
            receipt=receipt_payload
        ))

    return result


@router.get("/all", response_model=List[BookingWithDetails])
async def get_all_bookings(
    status: Optional[BookingStatus] = Query(None),
    current_user = Depends(get_current_admin)
):
    """Get all bookings (Admin only)."""
    db = get_database()
    
    query = {}
    if status:
        query["status"] = status
    
    cursor = db.bookings.find(query).sort("created_at", -1)
    bookings = await cursor.to_list(length=None)
    
    result = []
    for booking in bookings:
        lot, slot, vehicle, user_doc = await gather(
            db.parking_lots.find_one({"_id": ObjectId(booking["lot_id"])}),
            db.parking_slots.find_one({"_id": ObjectId(booking["slot_id"])}),
            db.vehicles.find_one({"_id": ObjectId(booking["vehicle_id"])}),
            db.users.find_one({"_id": ObjectId(booking["user_id"])}),
        )

        lot_response = None
        if lot:
            lot_response = ParkingLotResponse(
                id=str(lot["_id"]),
                name=lot["name"],
                address=lot["address"],
                latitude=lot["latitude"],
                longitude=lot["longitude"],
                total_slots=lot["total_slots"],
                available_slots=lot["available_slots"]
,
                price_per_hour=lot["price_per_hour"],
                operating_hours=lot["operating_hours"],
                amenities=lot.get("amenities", []),
                image_url=lot.get("image_url"),
                is_active=lot["is_active"],
                rating=lot.get("rating"),
                total_reviews=lot.get("total_reviews", 0),
                created_at=lot["created_at"]
            )

        vehicle_response = None
        if vehicle:
            vehicle_response = VehicleResponse(
                id=str(vehicle["_id"]),
                user_id=vehicle["user_id"],
                license_plate=vehicle["license_plate"],
                make=vehicle["make"],
                model=vehicle["model"],
                color=vehicle.get("color"),
                vehicle_type=vehicle["vehicle_type"],
                created_at=vehicle["created_at"]
            )

        receipt_payload = await _maybe_build_receipt(
            booking=booking,
            lot=lot,
            slot=slot,
            vehicle=vehicle,
            user=user_doc,
        )

        result.append(BookingWithDetails(
            id=str(booking["_id"]),
            user_id=booking["user_id"],
            lot_id=booking["lot_id"],
            slot_id=booking["slot_id"],
            vehicle_id=booking["vehicle_id"],
            start_time=booking["start_time"],
            end_time=booking["end_time"],
            status=booking["status"],
            total_price=booking["total_price"],
            payment_status=booking["payment_status"],
            qr_code=booking.get("qr_code"),
            created_at=booking["created_at"],
            updated_at=booking["updated_at"],
            parking_lot=lot_response,
            vehicle=vehicle_response,
            receipt=receipt_payload
        ))

    return result


@router.get("/{booking_id}", response_model=BookingWithDetails)
async def get_booking(
    booking_id: str,
    current_user = Depends(get_current_user)
):
    """Get a specific booking by ID."""
    db = get_database()
    
    try:
        booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid booking ID"
        )
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if user owns this booking or is admin
    if booking["user_id"] != current_user.user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this booking"
        )
    
    # Get parking lot details
    lot = await db.parking_lots.find_one({"_id": ObjectId(booking["lot_id"])})
    lot_response = None
    if lot:
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
    
    # Get vehicle details
    vehicle = await db.vehicles.find_one({"_id": ObjectId(booking["vehicle_id"])})
    vehicle_response = None
    if vehicle:
        vehicle_response = VehicleResponse(
            id=str(vehicle["_id"]),
            user_id=vehicle["user_id"],
            license_plate=vehicle["license_plate"],
            make=vehicle["make"],
            model=vehicle["model"],
            color=vehicle.get("color"),
            vehicle_type=vehicle["vehicle_type"],
            created_at=vehicle["created_at"]
        )
    
    receipt_payload: Optional[BookingReceipt] = None
    if lot and vehicle:
        try:
            slot = await db.parking_slots.find_one({"_id": ObjectId(booking["slot_id"])}) or {}
            user = await db.users.find_one({"_id": ObjectId(booking["user_id"])}) or {}
            receipt_payload = build_receipt_payload(
                booking_id=str(booking["_id"]),
                user=user,
                lot=lot,
                slot=slot,
                vehicle=vehicle,
                start_time=booking["start_time"],
                end_time=booking["end_time"],
                booking_status=booking.get("status", BookingStatus.PENDING),
                payment_status=booking.get("payment_status", PaymentStatus.PENDING),
                total_price=booking["total_price"],
                created_at=booking.get("created_at", datetime.utcnow()),
                qr_code=booking.get("qr_code")
            )
        except Exception as err:
            logger.error(f"Failed to build booking receipt payload: {err}")
            receipt_payload = booking.get("receipt")
    else:
        receipt_payload = booking.get("receipt")
    
    return BookingWithDetails(
        id=str(booking["_id"]),
        user_id=booking["user_id"],
        lot_id=booking["lot_id"],
        slot_id=booking["slot_id"],
        vehicle_id=booking["vehicle_id"],
        start_time=booking["start_time"],
        end_time=booking["end_time"],
        status=booking["status"],
        total_price=booking["total_price"],
        payment_status=booking["payment_status"],
        qr_code=booking.get("qr_code"),
        created_at=booking["created_at"],
        updated_at=booking["updated_at"],
        parking_lot=lot_response,
        vehicle=vehicle_response,
        receipt=receipt_payload
    )


@router.put("/{booking_id}", response_model=BookingResponse)
async def update_booking(
    booking_id: str,
    update_data: BookingUpdate,
    current_user = Depends(get_current_user)
):
    """Update a booking (extend time or cancel)."""
    db = get_database()
    
    try:
        booking = await db.bookings.find_one({"_id": ObjectId(booking_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid booking ID"
        )
    
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Booking not found"
        )
    
    # Check if user owns this booking or is admin
    if booking["user_id"] != current_user.user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this booking"
        )
    
    update_dict = {k: v for k, v in update_data.dict(exclude_unset=True).items()}
    
    # If extending time, recalculate price
    if "end_time" in update_dict:
        lot = await db.parking_lots.find_one({"_id": ObjectId(booking["lot_id"])})
        new_price = calculate_parking_price(
            lot["price_per_hour"],
            booking["start_time"],
            update_dict["end_time"]
        )
        update_dict["total_price"] = new_price
    
    # If cancelling, free up the slot
    if update_dict.get("status") == BookingStatus.CANCELLED:
        await db.parking_slots.update_one(
            {"_id": ObjectId(booking["slot_id"])},
            {"$set": {"status": SlotStatus.AVAILABLE, "updated_at": datetime.utcnow()}}
        )
        await db.parking_lots.update_one(
            {"_id": ObjectId(booking["lot_id"])},
            {"$inc": {"available_slots": 1}, "$set": {"updated_at": datetime.utcnow()}}
        )
    
    update_dict["updated_at"] = datetime.utcnow()
    
    result = await db.bookings.find_one_and_update(
        {"_id": ObjectId(booking_id)},
        {"$set": update_dict},
        return_document=ReturnDocument.AFTER
    )
    
    logger.info(f"Booking updated: {booking_id}")
    
    return BookingResponse(
        id=str(result["_id"]),
        user_id=result["user_id"],
        lot_id=result["lot_id"],
        slot_id=result["slot_id"],
        vehicle_id=result["vehicle_id"],
        start_time=result["start_time"],
        end_time=result["end_time"],
        status=result["status"],
        total_price=result["total_price"],
        payment_status=result["payment_status"],
        qr_code=result.get("qr_code"),
        created_at=result["created_at"],
        updated_at=result["updated_at"]
    )
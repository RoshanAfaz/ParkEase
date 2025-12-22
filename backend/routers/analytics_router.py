"""
Analytics and dashboard statistics routes.
"""
from fastapi import APIRouter, HTTPException, status, Depends, Query
from typing import List
from datetime import datetime, timedelta
from database import get_database
from models import DashboardStats, BookingAnalytics
from auth import get_current_user, get_current_admin
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/analytics", tags=["Analytics"])


@router.get("/dashboard", response_model=DashboardStats)
async def get_dashboard_stats(current_user = Depends(get_current_admin)):
    """Get dashboard statistics (Admin only)."""
    db = get_database()
    
    # Total bookings
    total_bookings = await db.bookings.count_documents({})
    
    # Active bookings
    active_bookings = await db.bookings.count_documents({
        "status": {"$in": ["confirmed", "active"]}
    })
    
    # Total revenue
    pipeline = [
        {"$match": {"payment_status": "paid"}},
        {"$group": {"_id": None, "total": {"$sum": "$total_price"}}}
    ]
    revenue_result = await db.bookings.aggregate(pipeline).to_list(length=1)
    total_revenue = revenue_result[0]["total"] if revenue_result else 0.0
    
    # Total parking lots
    total_parking_lots = await db.parking_lots.count_documents({"is_active": True})
    
    # Total users
    total_users = await db.users.count_documents({"role": "user"})
    
    # Calculate occupancy rate
    total_slots_pipeline = [
        {"$match": {"is_active": True}},
        {"$group": {"_id": None, "total": {"$sum": "$total_slots"}}}
    ]
    total_slots_result = await db.parking_lots.aggregate(total_slots_pipeline).to_list(length=1)
    total_slots = total_slots_result[0]["total"] if total_slots_result else 0
    
    available_slots_pipeline = [
        {"$match": {"is_active": True}},
        {"$group": {"_id": None, "total": {"$sum": "$available_slots"}}}
    ]
    available_slots_result = await db.parking_lots.aggregate(available_slots_pipeline).to_list(length=1)
    available_slots = available_slots_result[0]["total"] if available_slots_result else 0
    
    occupancy_rate = 0.0
    if total_slots > 0:
        occupied_slots = total_slots - available_slots
        occupancy_rate = (occupied_slots / total_slots) * 100
    
    return DashboardStats(
        total_bookings=total_bookings,
        active_bookings=active_bookings,
        total_revenue=round(total_revenue, 2),
        total_parking_lots=total_parking_lots,
        total_users=total_users,
        occupancy_rate=round(occupancy_rate, 2)
    )


@router.get("/bookings", response_model=List[BookingAnalytics])
async def get_booking_analytics(
    days: int = Query(30, description="Number of days to analyze"),
    current_user = Depends(get_current_admin)
):
    """Get booking analytics over time (Admin only)."""
    db = get_database()
    
    start_date = datetime.utcnow() - timedelta(days=days)
    
    pipeline = [
        {
            "$match": {
                "created_at": {"$gte": start_date}
            }
        },
        {
            "$group": {
                "_id": {
                    "$dateToString": {
                        "format": "%Y-%m-%d",
                        "date": "$created_at"
                    }
                },
                "bookings": {"$sum": 1},
                "revenue": {
                    "$sum": {
                        "$cond": [
                            {"$eq": ["$payment_status", "paid"]},
                            "$total_price",
                            0
                        ]
                    }
                }
            }
        },
        {
            "$sort": {"_id": 1}
        }
    ]
    
    results = await db.bookings.aggregate(pipeline).to_list(length=None)
    
    return [
        BookingAnalytics(
            date=result["_id"],
            bookings=result["bookings"],
            revenue=round(result["revenue"], 2)
        )
        for result in results
    ]


@router.get("/user-stats")
async def get_user_stats(current_user = Depends(get_current_user)):
    """Get statistics for the current user."""
    db = get_database()
    
    # Total bookings
    total_bookings = await db.bookings.count_documents({
        "user_id": current_user.user_id
    })
    
    # Active bookings
    active_bookings = await db.bookings.count_documents({
        "user_id": current_user.user_id,
        "status": {"$in": ["confirmed", "active"]}
    })
    
    # Total spent
    pipeline = [
        {
            "$match": {
                "user_id": current_user.user_id,
                "payment_status": "paid"
            }
        },
        {
            "$group": {
                "_id": None,
                "total": {"$sum": "$total_price"}
            }
        }
    ]
    spent_result = await db.bookings.aggregate(pipeline).to_list(length=1)
    total_spent = spent_result[0]["total"] if spent_result else 0.0
    
    # Favorite parking lot (most bookings)
    favorite_pipeline = [
        {
            "$match": {"user_id": current_user.user_id}
        },
        {
            "$group": {
                "_id": "$lot_id",
                "count": {"$sum": 1}
            }
        },
        {
            "$sort": {"count": -1}
        },
        {
            "$limit": 1
        }
    ]
    favorite_result = await db.bookings.aggregate(favorite_pipeline).to_list(length=1)
    favorite_lot_id = favorite_result[0]["_id"] if favorite_result else None
    
    favorite_lot = None
    if favorite_lot_id:
        from bson import ObjectId
        lot = await db.parking_lots.find_one({"_id": ObjectId(favorite_lot_id)})
        if lot:
            favorite_lot = {
                "id": str(lot["_id"]),
                "name": lot["name"],
                "address": lot["address"]
            }
    
    return {
        "total_bookings": total_bookings,
        "active_bookings": active_bookings,
        "total_spent": round(total_spent, 2),
        "favorite_parking_lot": favorite_lot
    }
"""
Review and rating routes for parking lots.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from typing import List
from bson import ObjectId
from datetime import datetime
from database import get_database
from models import ReviewCreate, ReviewResponse
from auth import get_current_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/reviews", tags=["Reviews"])


@router.post("", response_model=ReviewResponse, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    current_user = Depends(get_current_user)
):
    """Create a review for a parking lot."""
    db = get_database()
    
    # Verify parking lot exists
    try:
        lot = await db.parking_lots.find_one({"_id": ObjectId(review_data.lot_id)})
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
    
    # Check if user has completed booking at this lot
    completed_booking = await db.bookings.find_one({
        "user_id": current_user.user_id,
        "lot_id": review_data.lot_id,
        "status": "completed"
    })
    
    if not completed_booking:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You can only review parking lots where you have completed bookings"
        )
    
    # Check if user already reviewed this lot
    existing_review = await db.reviews.find_one({
        "user_id": current_user.user_id,
        "lot_id": review_data.lot_id
    })
    
    if existing_review:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already reviewed this parking lot"
        )
    
    # Get user info
    user = await db.users.find_one({"_id": ObjectId(current_user.user_id)})
    
    # Create review document
    review_doc = {
        **review_data.dict(),
        "user_id": current_user.user_id,
        "user_name": user["full_name"],
        "created_at": datetime.utcnow()
    }
    
    result = await db.reviews.insert_one(review_doc)
    review_id = str(result.inserted_id)
    
    # Update parking lot rating
    await update_parking_lot_rating(db, review_data.lot_id)
    
    logger.info(f"Review created: {review_id} for lot {review_data.lot_id}")
    
    return ReviewResponse(
        id=review_id,
        lot_id=review_data.lot_id,
        user_id=current_user.user_id,
        user_name=user["full_name"],
        rating=review_data.rating,
        comment=review_data.comment,
        created_at=review_doc["created_at"]
    )


@router.get("/lot/{lot_id}", response_model=List[ReviewResponse])
async def get_lot_reviews(lot_id: str):
    """Get all reviews for a parking lot."""
    db = get_database()
    
    cursor = db.reviews.find({"lot_id": lot_id}).sort("created_at", -1)
    reviews = await cursor.to_list(length=None)
    
    return [
        ReviewResponse(
            id=str(review["_id"]),
            lot_id=review["lot_id"],
            user_id=review["user_id"],
            user_name=review["user_name"],
            rating=review["rating"],
            comment=review.get("comment"),
            created_at=review["created_at"]
        )
        for review in reviews
    ]


@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: str,
    current_user = Depends(get_current_user)
):
    """Delete a review (only by the review author)."""
    db = get_database()
    
    try:
        review = await db.reviews.find_one({"_id": ObjectId(review_id)})
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid review ID"
        )
    
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Review not found"
        )
    
    # Check if user owns this review or is admin
    if review["user_id"] != current_user.user_id and current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this review"
        )
    
    lot_id = review["lot_id"]
    
    await db.reviews.delete_one({"_id": ObjectId(review_id)})
    
    # Update parking lot rating
    await update_parking_lot_rating(db, lot_id)
    
    logger.info(f"Review deleted: {review_id}")


async def update_parking_lot_rating(db, lot_id: str):
    """Recalculate and update parking lot average rating."""
    cursor = db.reviews.find({"lot_id": lot_id})
    reviews = await cursor.to_list(length=None)
    
    if reviews:
        avg_rating = sum(r["rating"] for r in reviews) / len(reviews)
        await db.parking_lots.update_one(
            {"_id": ObjectId(lot_id)},
            {
                "$set": {
                    "rating": round(avg_rating, 1),
                    "total_reviews": len(reviews),
                    "updated_at": datetime.utcnow()
                }
            }
        )
    else:
        await db.parking_lots.update_one(
            {"_id": ObjectId(lot_id)},
            {
                "$set": {
                    "rating": None,
                    "total_reviews": 0,
                    "updated_at": datetime.utcnow()
                }
            }
        )
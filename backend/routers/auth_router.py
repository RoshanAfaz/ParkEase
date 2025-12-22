"""
Authentication routes for user registration, login, and profile management.
"""
from fastapi import APIRouter, HTTPException, status, Depends
from datetime import timedelta
from bson import ObjectId
from database import get_database
from models import UserCreate, UserLogin, UserResponse, Token, UserUpdate, UserRole
from auth import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user
)
from config import settings
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/api/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserCreate):
    """Register a new user."""
    db = get_database()
    
    # Check if user already exists
    existing_user = await db.users.find_one({"email": user_data.email})
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user document
    user_doc = {
        "email": user_data.email,
        "full_name": user_data.full_name,
        "phone": user_data.phone,
        "password": hashed_password,
        "role": UserRole.USER,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    
    result = await db.users.insert_one(user_doc)
    user_doc["id"] = str(result.inserted_id)
    
    logger.info(f"New user registered: {user_data.email}")
    
    return UserResponse(
        id=user_doc["id"],
        email=user_doc["email"],
        full_name=user_doc["full_name"],
        phone=user_doc["phone"],
        role=user_doc["role"],
        created_at=user_doc["created_at"]
    )


@router.post("/login", response_model=Token)
async def login(credentials: UserLogin):
    """Login user and return JWT token."""
    db = get_database()
    
    # Find user
    user = await db.users.find_one({"email": credentials.email})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user["password"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )
    
    # Create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={
            "sub": str(user["_id"]),
            "email": user["email"],
            "role": user["role"]
        },
        expires_delta=access_token_expires
    )
    
    logger.info(f"User logged in: {credentials.email}")
    
    return Token(access_token=access_token, token_type="bearer")


@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user = Depends(get_current_user)):
    """Get current user profile."""
    db = get_database()
    
    user = await db.users.find_one({"_id": ObjectId(current_user.user_id)})
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    return UserResponse(
        id=str(user["_id"]),
        email=user["email"],
        full_name=user["full_name"],
        phone=user.get("phone"),
        role=user["role"],
        created_at=user["created_at"]
    )


@router.put("/me", response_model=UserResponse)
async def update_profile(
    update_data: UserUpdate,
    current_user = Depends(get_current_user)
):
    """Update current user profile."""
    db = get_database()
    
    # Prepare update data
    update_dict = {k: v for k, v in update_data.dict(exclude_unset=True).items()}
    if not update_dict:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No fields to update"
        )
    
    update_dict["updated_at"] = datetime.utcnow()
    
    # Update user
    result = await db.users.find_one_and_update(
        {"_id": ObjectId(current_user.user_id)},
        {"$set": update_dict},
        return_document=True
    )
    
    if not result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    logger.info(f"User profile updated: {current_user.email}")
    
    return UserResponse(
        id=str(result["_id"]),
        email=result["email"],
        full_name=result["full_name"],
        phone=result.get("phone"),
        role=result["role"],
        created_at=result["created_at"]
    )


from datetime import datetime
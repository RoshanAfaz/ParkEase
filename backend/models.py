"""
Pydantic models for request/response validation.
"""
from pydantic import BaseModel, EmailStr, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum


# Enums
class UserRole(str, Enum):
    USER = "user"
    ADMIN = "admin"


class SlotType(str, Enum):
    REGULAR = "regular"
    DISABLED = "disabled"
    ELECTRIC = "electric"
    COMPACT = "compact"


class SlotStatus(str, Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    RESERVED = "reserved"
    MAINTENANCE = "maintenance"


class BookingStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    ACTIVE = "active"
    COMPLETED = "completed"
    CANCELLED = "cancelled"


class PaymentStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    REFUNDED = "refunded"
    FAILED = "failed"


# User Models
class UserBase(BaseModel):
    email: EmailStr
    full_name: str
    phone: Optional[str] = None


class UserCreate(UserBase):
    password: str
    role: Optional[UserRole] = UserRole.USER


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserUpdate(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    role: Optional[UserRole] = None
    password: Optional[str] = None
    is_verified: Optional[bool] = None


class UserResponse(UserBase):
    id: str
    role: UserRole
    is_verified: bool = False
    created_at: datetime
    
    class Config:
        from_attributes = True


# Vehicle Models
class VehicleBase(BaseModel):
    license_plate: str
    make: str
    model: str
    color: Optional[str] = None
    vehicle_type: str = "car"  # car, motorcycle, truck, etc.


class VehicleCreate(VehicleBase):
    pass


class VehicleResponse(VehicleBase):
    id: str
    user_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Parking Lot Models
class ParkingSlot(BaseModel):
    slot_number: str
    slot_type: SlotType = SlotType.REGULAR
    status: SlotStatus = SlotStatus.AVAILABLE
    floor_level: int = 1


class ParkingLotBase(BaseModel):
    name: str
    address: str
    latitude: float = Field(..., ge=-90, le=90)
    longitude: float = Field(..., ge=-180, le=180)
    total_slots: int = Field(..., ge=0)
    price_per_hour: float = Field(..., ge=0)
    operating_hours: str = "24/7"
    amenities: List[str] = []
    image_url: Optional[str] = None


class ParkingLotCreate(ParkingLotBase):
    slots: List[ParkingSlot] = []


class ParkingLotUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    latitude: Optional[float] = Field(None, ge=-90, le=90)
    longitude: Optional[float] = Field(None, ge=-180, le=180)
    price_per_hour: Optional[float] = Field(None, ge=0)
    operating_hours: Optional[str] = None
    amenities: Optional[List[str]] = None
    image_url: Optional[str] = None
    is_active: Optional[bool] = None


class ParkingLotResponse(ParkingLotBase):
    id: str
    available_slots: int
    is_active: bool
    rating: Optional[float] = None
    total_reviews: int = 0
    created_at: datetime
    
    class Config:
        from_attributes = True


class ParkingSlotResponse(ParkingSlot):
    id: str
    lot_id: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class ParkingSlotCreate(BaseModel):
    slot_number: str
    slot_type: SlotType = SlotType.REGULAR
    status: Optional[SlotStatus] = SlotStatus.AVAILABLE
    floor_level: int = 1


class ParkingSlotUpdate(BaseModel):
    slot_type: Optional[SlotType] = None
    status: Optional[SlotStatus] = None
    floor_level: Optional[int] = None


# Booking Models
class BookingBase(BaseModel):
    lot_id: str
    slot_id: str
    vehicle_id: str
    start_time: datetime
    end_time: datetime
    
    @validator('end_time')
    def end_time_must_be_after_start_time(cls, v, values):
        if 'start_time' in values and v <= values['start_time']:
            raise ValueError('end_time must be after start_time')
        return v


class BookingCreate(BookingBase):
    pass


class BookingUpdate(BaseModel):
    end_time: Optional[datetime] = None
    status: Optional[BookingStatus] = None


class ReceiptSlotInfo(BaseModel):
    slot_number: str
    floor_level: Optional[int] = None
    slot_type: Optional[SlotType] = None


class ReceiptVehicleInfo(BaseModel):
    license_plate: str
    make: Optional[str]
    model: Optional[str]
    color: Optional[str]
    vehicle_type: Optional[str]


class BookingReceipt(BaseModel):
    booking_id: str
    confirmation_number: str
    user_name: str
    user_email: str
    user_phone: Optional[str]
    parking_lot_name: str
    parking_lot_address: str
    parking_lot_contact: Optional[str] = None
    slot: ReceiptSlotInfo
    vehicle: ReceiptVehicleInfo
    start_time: datetime
    end_time: datetime
    booking_status: BookingStatus
    payment_status: PaymentStatus
    total_price: float
    created_at: datetime
    qr_code: Optional[str] = None


class BookingResponse(BookingBase):
    id: str
    user_id: str
    status: BookingStatus
    total_price: float
    payment_status: PaymentStatus
    qr_code: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    receipt: Optional[BookingReceipt] = None
    
    class Config:
        from_attributes = True


class BookingWithDetails(BookingResponse):
    parking_lot: Optional[ParkingLotResponse] = None
    vehicle: Optional[VehicleResponse] = None


# Review Models
class ReviewBase(BaseModel):
    lot_id: str
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = None


class ReviewCreate(ReviewBase):
    pass


class ReviewResponse(ReviewBase):
    id: str
    user_id: str
    user_name: str
    created_at: datetime
    
    class Config:
        from_attributes = True


# Payment Models
class PaymentBase(BaseModel):
    booking_id: str
    amount: float
    payment_method: str = "stripe"


class PaymentCreate(PaymentBase):
    pass


class PaymentResponse(PaymentBase):
    id: str
    user_id: str
    status: PaymentStatus
    transaction_id: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True


# Token Models
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    user_id: Optional[str] = None
    email: Optional[str] = None
    role: Optional[str] = None


# Analytics Models
class DashboardStats(BaseModel):
    total_bookings: int
    active_bookings: int
    total_revenue: float
    total_parking_lots: int
    total_users: int
    occupancy_rate: float


class BookingAnalytics(BaseModel):
    date: str
    bookings: int
    revenue: float


# Search Models
class ParkingSearchQuery(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    max_distance: float = 5.0  # km
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    slot_type: Optional[SlotType] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
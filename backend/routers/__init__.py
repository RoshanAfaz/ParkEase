"""
Routers package initialization.
"""
from . import (
    auth_router,
    parking_router,
    booking_router,
    vehicle_router,
    review_router,
    analytics_router,
    admin_router
)

__all__ = [
    "auth_router",
    "parking_router",
    "booking_router",
    "vehicle_router",
    "review_router",
    "analytics_router",
    "admin_router"
]
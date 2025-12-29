"""
Payment router for handling dummy payments.
"""
from fastapi import APIRouter, HTTPException, Depends, status
from pydantic import BaseModel
import logging
import uuid
import asyncio
from auth import get_current_user

router = APIRouter(prefix="/api/payments", tags=["Payments"])
logger = logging.getLogger(__name__)

class DummyPaymentRequest(BaseModel):
    amount: int  # Amount in cents/paise
    currency: str = "inr"
    payment_method: str = "upi" # upi, card, netbanking

class DummyPaymentResponse(BaseModel):
    success: bool
    transaction_id: str
    message: str

@router.post("/process-dummy-payment", response_model=DummyPaymentResponse)
async def process_dummy_payment(
    request: DummyPaymentRequest,
    current_user = Depends(get_current_user)
):
    """
    Process a dummy payment.
    Simulates a payment delay and returns success.
    """
    try:
        # Simulate processing delay
        await asyncio.sleep(1.5)
        
        # Generate a fake transaction ID
        transaction_id = f"txn_{uuid.uuid4().hex[:12]}"
        
        return DummyPaymentResponse(
            success=True,
            transaction_id=transaction_id,
            message="Payment processed successfully (Dummy)"
        )
        
    except Exception as e:
        logger.error(f"Dummy payment failed: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to process dummy payment: {str(e)}"
        )

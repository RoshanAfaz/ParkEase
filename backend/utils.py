"""
Utility functions for QR code generation, email sending, etc.
"""
import base64
import io
import logging
from dataclasses import dataclass
from datetime import datetime, timedelta
from typing import Any, Dict, Optional

import aiosmtplib
import qrcode
from email import encoders
from email.mime.base import MIMEBase
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from jinja2 import Template
from reportlab.lib import colors
from reportlab.lib.pagesizes import LETTER
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import (
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)

from config import settings
from models import (
    BookingReceipt,
    BookingStatus,
    PaymentStatus,
    ReceiptSlotInfo,
    ReceiptVehicleInfo,
)

logger = logging.getLogger(__name__)


@dataclass
class ReceiptPDFResult:
    """Structure returned by receipt PDF generation."""
    filename: str
    content_type: str
    data: bytes


def build_receipt_payload(
    *,
    booking_id: str,
    user: dict,
    lot: dict,
    slot: dict,
    vehicle: dict,
    start_time: datetime,
    end_time: datetime,
    booking_status: BookingStatus,
    payment_status: PaymentStatus,
    total_price: float,
    created_at: datetime,
    qr_code: Optional[str] = None,
) -> BookingReceipt:
    """Create a consistent receipt payload from booking data."""
    slot_contact = lot.get("contact_number") or lot.get("phone")

    return BookingReceipt(
        booking_id=booking_id,
        confirmation_number=f"PA-{booking_id[-6:].upper()}",
        user_name=user.get("full_name", ""),
        user_email=user.get("email", ""),
        user_phone=user.get("phone"),
        parking_lot_name=lot.get("name", ""),
        parking_lot_address=lot.get("address", ""),
        parking_lot_contact=slot_contact,
        slot=ReceiptSlotInfo(
            slot_number=slot.get("slot_number", ""),
            floor_level=slot.get("floor_level"),
            slot_type=slot.get("slot_type"),
        ),
        vehicle=ReceiptVehicleInfo(
            license_plate=vehicle.get("license_plate", ""),
            make=vehicle.get("make"),
            model=vehicle.get("model"),
            color=vehicle.get("color"),
            vehicle_type=vehicle.get("vehicle_type"),
        ),
        start_time=start_time,
        end_time=end_time,
        booking_status=booking_status,
        payment_status=payment_status,
        total_price=total_price,
        created_at=created_at,
        qr_code=qr_code,
    )


def generate_qr_code(data: str) -> str:
    """
    Generate a QR code from data and return as base64 string.
    
    Args:
        data: String data to encode in QR code
        
    Returns:
        Base64 encoded QR code image
    """
    try:
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_L,
            box_size=10,
            border=4,
        )
        qr.add_data(data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format='PNG')
        img_str = base64.b64encode(buffer.getvalue()).decode()
        
        return f"data:image/png;base64,{img_str}"
        
    except Exception as e:
        logger.error(f"Error generating QR code: {e}")
        return ""


async def send_email(
    to_email: str,
    subject: str,
    html_content: str,
    text_content: Optional[str] = None,
    attachments: Optional[list[MIMEBase]] = None
) -> bool:
    """
    Send an email using SMTP.
    
    Args:
        to_email: Recipient email address
        subject: Email subject
        html_content: HTML content of the email
        text_content: Plain text content (optional)
        attachments: Optional list of MIME attachment parts
        
    Returns:
        True if email sent successfully, False otherwise
    """
    if not settings.smtp_user or not settings.smtp_password:
        logger.warning("SMTP credentials not configured, skipping email")
        return False
    
    try:
        message = MIMEMultipart("mixed")
        message["From"] = settings.email_from
        message["To"] = to_email
        message["Subject"] = subject

        # Alternative part for text + HTML content
        alternative_part = MIMEMultipart("alternative")
        if text_content:
            alternative_part.attach(MIMEText(text_content, "plain"))
        alternative_part.attach(MIMEText(html_content, "html"))
        message.attach(alternative_part)

        # Attach any additional MIME parts
        if attachments:
            for attachment in attachments:
                message.attach(attachment)
        
        # Send email
        await aiosmtplib.send(
            message,
            hostname=settings.smtp_host,
            port=settings.smtp_port,
            username=settings.smtp_user,
            password=settings.smtp_password,
            start_tls=True,
        )
        
        logger.info(f"Email sent successfully to {to_email}")
        return True
        
    except Exception as e:
        logger.error(f"Error sending email: {e}")
        return False


async def send_booking_confirmation_email(
    to_email: str,
    user_name: str,
    booking_id: str,
    parking_lot_name: str,
    start_time: str,
    end_time: str,
    total_price: float,
    qr_code: str,
    receipt: Optional[BookingReceipt] = None,
    pdf_receipt: Optional[ReceiptPDFResult] = None
) -> bool:
    """Send booking confirmation email with QR code."""

    receipt_section = ""
    if receipt:
        receipt_section = build_receipt_html_summary(receipt)

    html_template = """
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .booking-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
            .qr-code { text-align: center; margin: 20px 0; }
            .qr-code img { max-width: 200px; }
            .footer { text-align: center; color: #666; margin-top: 20px; font-size: 12px; }
            .receipt-section { background: #eef2ff; padding: 16px; border-radius: 8px; margin: 20px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🅿️ ParkEasy</h1>
                <h2>Booking Confirmed!</h2>
            </div>
            <div class="content">
                <p>Hi {{ user_name }},</p>
                <p>Your parking spot has been successfully booked!</p>

                <div class="booking-details">
                    <h3>Booking Details</h3>
                    <div class="detail-row">
                        <strong>Booking ID:</strong>
                        <span>{{ booking_id }}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Parking Lot:</strong>
                        <span>{{ parking_lot_name }}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Start Time:</strong>
                        <span>{{ start_time }}</span>
                    </div>
                    <div class="detail-row">
                        <strong>End Time:</strong>
                        <span>{{ end_time }}</span>
                    </div>
                    <div class="detail-row">
                        <strong>Total Price:</strong>
                        <span>${{ total_price }}</span>
                    </div>
                </div>

                {{ receipt_section | safe }}

                <div class="qr-code">
                    <h3>Your QR Code</h3>
                    <p>Show this QR code at the parking entrance</p>
                    <img src="{{ qr_code }}" alt="Booking QR Code">
                </div>

                <p>Thank you for choosing ParkEasy!</p>

                <div class="footer">
                    <p>This is an automated email. Please do not reply.</p>
                    <p>&copy; 2024 ParkEasy. All rights reserved.</p>
                </div>
            </div>
        </div>
    </body>
    </html>
    """

    template = Template(html_template)
    html_content = template.render(
        user_name=user_name,
        booking_id=booking_id,
        parking_lot_name=parking_lot_name,
        start_time=start_time,
        end_time=end_time,
        total_price=total_price,
        qr_code=qr_code,
        receipt_section=receipt_section
    )

    pdf_attachment: Optional[MIMEBase] = None
    if pdf_receipt:
        pdf_attachment = MIMEBase("application", "pdf")
        pdf_attachment.set_payload(pdf_receipt.data)
        encoders.encode_base64(pdf_attachment)
        pdf_attachment.add_header(
            "Content-Disposition",
            "attachment",
            filename=pdf_receipt.filename,
        )
        pdf_attachment.add_header("Content-Type", pdf_receipt.content_type)

    return await send_email(
        to_email=to_email,
        subject=f"Booking Confirmation - {parking_lot_name}",
        html_content=html_content,
        attachments=[pdf_attachment] if pdf_attachment else None
    )


def build_receipt_html_summary(receipt: BookingReceipt) -> str:
    """Render a compact HTML summary for receipt emails."""
    vehicle_details = f"{receipt.vehicle.license_plate}"
    if receipt.vehicle.make or receipt.vehicle.model:
        make_model = " ".join(filter(None, [receipt.vehicle.make, receipt.vehicle.model]))
        vehicle_details += f" ({make_model})"

    lot_contact = receipt.parking_lot_contact or "Not provided"

    return f"""
        <div class=\"receipt-section\">
            <h3>Receipt Summary</h3>
            <div class=\"detail-row\">
                <strong>Confirmation:</strong>
                <span>{receipt.confirmation_number}</span>
            </div>
            <div class=\"detail-row\">
                <strong>Vehicle:</strong>
                <span>{vehicle_details}</span>
            </div>
            <div class=\"detail-row\">
                <strong>Slot:</strong>
                <span>{receipt.slot.slot_number}</span>
            </div>
            <div class=\"detail-row\">
                <strong>Lot Contact:</strong>
                <span>{lot_contact}</span>
            </div>
        </div>
    """


def build_receipt_pdf(receipt: BookingReceipt) -> ReceiptPDFResult:
    """Generate a PDF receipt using the provided receipt payload."""

    buffer = io.BytesIO()
    pdf_filename = f"receipt_{receipt.booking_id}.pdf"

    # Setup document
    doc = SimpleDocTemplate(
        buffer,
        pagesize=LETTER,
        title=f"Booking Receipt - {receipt.confirmation_number}",
    )
    styles = getSampleStyleSheet()
    style_title = styles["Title"]
    style_normal = styles["BodyText"]
    style_heading = styles["Heading2"]

    elements = []

    # Title
    elements.append(Paragraph("ParkEasy Booking Receipt", style_title))
    elements.append(Paragraph(f"Confirmation: {receipt.confirmation_number}", style_heading))
    elements.append(Spacer(1, 12))

    # Customer details
    customer_data = [
        ["Customer Name", receipt.user_name or ""],
        ["Email", receipt.user_email],
        ["Phone", receipt.user_phone or "Not provided"],
    ]

    elements.append(Paragraph("Customer Details", style_heading))
    elements.append(build_receipt_table(customer_data))
    elements.append(Spacer(1, 12))

    # Parking lot details
    lot_data = [
        ["Parking Lot", receipt.parking_lot_name],
        ["Address", receipt.parking_lot_address],
        ["Contact", receipt.parking_lot_contact or "Not provided"],
    ]

    elements.append(Paragraph("Parking Facility", style_heading))
    elements.append(build_receipt_table(lot_data))
    elements.append(Spacer(1, 12))

    # Slot and vehicle
    slot_vehicle_data = [
        ["Slot Number", receipt.slot.slot_number],
        ["Slot Type", (receipt.slot.slot_type or "Not specified").capitalize()],
        ["Floor Level", receipt.slot.floor_level or "N/A"],
        ["Vehicle", receipt.vehicle.license_plate],
        ["Make", receipt.vehicle.make or "N/A"],
        ["Model", receipt.vehicle.model or "N/A"],
        ["Color", receipt.vehicle.color or "N/A"],
        ["Vehicle Type", (receipt.vehicle.vehicle_type or "N/A").title()],
    ]

    elements.append(Paragraph("Parking Slot & Vehicle", style_heading))
    elements.append(build_receipt_table(slot_vehicle_data))
    elements.append(Spacer(1, 12))

    # Booking timing & pricing
    booking_data = [
        ["Start Time", receipt.start_time.strftime("%Y-%m-%d %H:%M")],
        ["End Time", receipt.end_time.strftime("%Y-%m-%d %H:%M")],
        ["Duration", calculate_duration_hours(receipt.start_time, receipt.end_time)],
        ["Booking Status", receipt.booking_status.value.title()],
        ["Payment Status", receipt.payment_status.value.title()],
        ["Total Price", f"₹{receipt.total_price:,.2f}"],
        ["Issued On", receipt.created_at.strftime("%Y-%m-%d %H:%M")],
    ]

    elements.append(Paragraph("Booking Summary", style_heading))
    elements.append(build_receipt_table(booking_data))
    elements.append(Spacer(1, 12))

    # Optional QR code preview
    if receipt.qr_code:
        elements.append(Paragraph("QR Code", style_heading))
        elements.append(Paragraph("Present this QR code at the entry point.", style_normal))
        elements.append(Spacer(1, 6))
        elements.append(build_receipt_qr_image(receipt.qr_code))
        elements.append(Spacer(1, 12))

    elements.append(Paragraph(
        "Thank you for using ParkEasy. We appreciate your business!",
        style_normal,
    ))

    doc.build(elements)

    pdf_bytes = buffer.getvalue()
    buffer.close()

    return ReceiptPDFResult(
        filename=pdf_filename,
        content_type="application/pdf",
        data=pdf_bytes,
    )


def build_receipt_table(data_rows: list[list[Any]]) -> Table:
    """Create a styled table for receipt sections."""
    table = Table(data_rows, colWidths=[150, 350])
    table.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.lightgrey),
        ("ALIGN", (0, 0), (-1, -1), "LEFT"),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
        ("BACKGROUND", (0, 1), (-1, -1), colors.whitesmoke),
        ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
    ]))
    return table


def build_receipt_qr_image(qr_code_data: str):
    """Decode base64 QR code and embed into PDF."""
    from reportlab.platypus import Image

    data_uri_prefix = "data:image/png;base64,"
    if not qr_code_data.startswith(data_uri_prefix):
        logger.warning("Unexpected QR code format for PDF inclusion.")
        return Paragraph("QR code unavailable", getSampleStyleSheet()["BodyText"])

    try:
        qr_bytes = base64.b64decode(qr_code_data[len(data_uri_prefix):])
        return Image(io.BytesIO(qr_bytes), width=120, height=120)
    except Exception as err:
        logger.error(f"Failed to embed QR code in receipt PDF: {err}")
        return Paragraph("QR code failed to load", getSampleStyleSheet()["BodyText"])


def calculate_duration_hours(start_time: datetime, end_time: datetime) -> str:
    """Return human readable duration between start and end."""
    duration = end_time - start_time
    total_hours = duration.total_seconds() / 3600
    hours = int(total_hours)
    minutes = int((total_hours - hours) * 60)
    parts = []
    if hours:
        parts.append(f"{hours} hour{'s' if hours != 1 else ''}")
    if minutes:
        parts.append(f"{minutes} minute{'s' if minutes != 1 else ''}")
    return ", ".join(parts) if parts else "Less than 1 hour"


def calculate_parking_price(
    price_per_hour: float,
    start_time: datetime,
    end_time: datetime,
    surge_multiplier: float = 1.0
) -> float:
    """
    Calculate parking price based on duration and surge pricing.
    
    Args:
        price_per_hour: Base price per hour
        start_time: Booking start time
        end_time: Booking end time
        surge_multiplier: Surge pricing multiplier (default 1.0)
        
    Returns:
        Total price
    """
    duration_hours = (end_time - start_time).total_seconds() / 3600
    
    # Minimum 1 hour charge
    if duration_hours < 1:
        duration_hours = 1
    
    base_price = price_per_hour * duration_hours
    total_price = base_price * surge_multiplier
    
    return round(total_price, 2)


def calculate_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """
    Calculate distance between two coordinates using Haversine formula.
    
    Args:
        lat1, lon1: First coordinate
        lat2, lon2: Second coordinate
        
    Returns:
        Distance in kilometers
    """
    from math import radians, sin, cos, sqrt, atan2
    
    R = 6371  # Earth's radius in kilometers
    
    lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
    
    dlat = lat2 - lat1
    dlon = lon2 - lon1
    
    a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
    c = 2 * atan2(sqrt(a), sqrt(1-a))
    
    distance = R * c
    return round(distance, 2)
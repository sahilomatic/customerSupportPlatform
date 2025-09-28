from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
from typing import List

from app.models.whatsapp import (
    WhatsAppMessageRequest, 
    WhatsAppSingleMessageRequest,
    BulkMessageResponse,
    MessageResult,
    SetupInstructions
)
from app.services.whatsapp_service import WhatsAppService
from app.utils.file_handlers import ExcelProcessor
from app.utils.validators import MobileNumberValidator

router = APIRouter()

# Dependency to get WhatsApp service
def get_whatsapp_service() -> WhatsAppService:
    return WhatsAppService()

@router.post("/send-bulk", response_model=BulkMessageResponse)
async def send_bulk_whatsapp_messages(
    file: UploadFile = File(..., description="Excel file with mobile numbers"),
    message: str = Form(..., description="Message to send"),
    column_name: str = Form(default="mobile", description="Column name containing mobile numbers"),
    whatsapp_service: WhatsAppService = Depends(get_whatsapp_service)
):
    """Send WhatsApp messages to mobile numbers from Excel file"""
    # Validate service
    if not whatsapp_service.validate_credentials():
        raise HTTPException(
            status_code=500,
            detail="WhatsApp service not configured. Please set Twilio credentials."
        )
    
    # Process Excel file
    df = await ExcelProcessor.read_excel_file(file)
    valid_numbers, invalid_numbers = ExcelProcessor.extract_mobile_numbers(df, column_name)
    print('valid_numbers',valid_numbers)
    print('invalid_numbers',invalid_numbers)

    if not valid_numbers:
        raise HTTPException(
            status_code=400,
            detail="No valid mobile numbers found in the file"
        )
    
    # Send messages
    results = await whatsapp_service.send_bulk_messages(valid_numbers, message)
    # Calculate stats
    success_count = sum(1 for r in results if r.status == "success")
    failed_count = len(results) - success_count
    
    return BulkMessageResponse(
        status="completed",
        total_numbers=len(valid_numbers),
        successful=success_count,
        failed=failed_count,
        invalid_numbers=invalid_numbers,
        results=results,
        message_sent=message
    )

@router.post("/send-single", response_model=MessageResult)
async def send_single_whatsapp_message(
    mobile_number: str = Form(..., description="Mobile number to test"),
    message: str = Form(..., description="Test message"),
    whatsapp_service: WhatsAppService = Depends(get_whatsapp_service)
):
    """Test sending message to a single number"""
    
    # Validate service
    if not whatsapp_service.validate_credentials():
        raise HTTPException(
            status_code=500,
            detail="WhatsApp service not configured. Please set Twilio credentials."
        )
    
    # Validate number
    cleaned_number = MobileNumberValidator.clean_mobile_number(mobile_number)
    if not cleaned_number:
        raise HTTPException(status_code=400, detail="Invalid mobile number format")
    
    # Send message
    result = await whatsapp_service.send_single_message(cleaned_number, message)
    return result

@router.get("/setup", response_model=SetupInstructions)
async def get_setup_instructions():
    """Get setup instructions for Twilio WhatsApp API"""
    return SetupInstructions(
        instructions=[
            "1. Sign up for Twilio account at https://www.twilio.com",
            "2. Go to Console Dashboard and get Account SID and Auth Token",
            "3. Navigate to WhatsApp Sandbox in Twilio Console",
            "4. Follow sandbox setup instructions",
            "5. Update TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env file",
            "6. For production, apply for WhatsApp Business API approval"
        ],
        sandbox_limitations=[
            "Can only send to pre-approved numbers",
            "Recipients must send 'join <sandbox-code>' to your sandbox number first",
            "24-hour session window for responses",
            "Limited message templates"
        ],
        excel_format={
            "required_column": "mobile (or specify custom column name)",
            "supported_formats": ["10-digit Indian numbers", "+91XXXXXXXXXX", "91XXXXXXXXXX"],
            "example": [
                {"mobile": "9876543210"},
                {"mobile": "+919876543210"},
                {"mobile": "919876543210"}
            ]
        }
    )
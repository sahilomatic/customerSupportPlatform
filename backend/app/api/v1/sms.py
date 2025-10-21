from fastapi import APIRouter, File, UploadFile, Form, HTTPException, Depends
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime

from app.services.sms_service import SMSService
from app.utils.file_handlers import ExcelProcessor
from app.utils.validators import MobileNumberValidator

router = APIRouter()

# -------------------- Response Models --------------------
class BulkSMSResult(BaseModel):
    number: str
    status: str
    error: Optional[str] = None
    timestamp: Optional[str] = None
    sid: Optional[str] = None

class BulkSMSResponse(BaseModel):
    status: str
    total_numbers: int
    successful: int
    failed: int
    invalid_numbers: List[str]
    results: List[BulkSMSResult]
    message_sent: str

class SingleSMSResult(BaseModel):
    number: str
    status: str
    error: Optional[str] = None
    sid: Optional[str] = None

# -------------------- Dependency --------------------
def get_sms_service() -> SMSService:
    return SMSService()

# -------------------- Single SMS --------------------
@router.post("/send-single", response_model=SingleSMSResult)
async def send_single_sms(
    mobile_number: str = Form(..., description="Recipient mobile number"),
    message: str = Form(..., description="Message to send"),
    sms_service: SMSService = Depends(get_sms_service)
):
    """Send a single SMS"""
    
    if not sms_service.validate_credentials():
        raise HTTPException(status_code=500, detail="SMS service not configured. Please set Twilio credentials.")
    
    cleaned_number = MobileNumberValidator.clean_mobile_number(mobile_number)
    if not cleaned_number:
        raise HTTPException(status_code=400, detail="Invalid mobile number format")
    
    result = await sms_service.send_single_sms(cleaned_number, message)
    return SingleSMSResult(
        number=result["number"],
        status=result["status"],
        error=result.get("error"),
        sid=result.get("sid")
    )

# -------------------- Bulk SMS --------------------
@router.post("/send-bulk", response_model=BulkSMSResponse)
async def send_bulk_sms(
    file: UploadFile = File(..., description="Excel file with mobile numbers"),
    message: str = Form(..., description="Message to send"),
    column_name: str = Form(default="mobile", description="Column name containing mobile numbers"),
    sms_service: SMSService = Depends(get_sms_service)
):
    """Send SMS to multiple numbers from Excel"""
    
    if not sms_service.validate_credentials():
        raise HTTPException(status_code=500, detail="SMS service not configured. Please set Twilio credentials.")
    
    # Read Excel
    df = await ExcelProcessor.read_excel_file(file)
    valid_numbers, invalid_numbers = ExcelProcessor.extract_mobile_numbers(df, column_name)
    
    if not valid_numbers:
        raise HTTPException(status_code=400, detail="No valid mobile numbers found in the file")
    
    # Send SMS
    results_raw = await sms_service.send_bulk_sms(valid_numbers, message)
    
    success_count = sum(1 for r in results_raw if r["status"] == "success")
    failed_count = len(results_raw) - success_count
    
    results = [
        BulkSMSResult(
            number=r["number"],
            status=r["status"],
            error=r.get("error"),
            timestamp=r.get("timestamp"),
            sid=r.get("sid")
        )
        for r in results_raw
    ]
    
    return BulkSMSResponse(
        status="completed",
        total_numbers=len(valid_numbers),
        successful=success_count,
        failed=failed_count,
        invalid_numbers=invalid_numbers,
        results=results,
        message_sent=message
    )

# -------------------- Setup Instructions --------------------
@router.get("/setup")
async def get_setup_instructions():
    return {
        "instructions": [
            "1. Sign up for Twilio account at https://www.twilio.com",
            "2. Go to Console Dashboard and get Account SID and Auth Token",
            "3. Buy a Twilio phone number capable of sending SMS",
            "4. Update TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_PHONE_NUMBER in .env file",
            "5. Test sending SMS using /send-single endpoint first",
        ],
        "note": "For bulk messages, ensure numbers are in E.164 format (+91XXXXXXXXXX)"
    }

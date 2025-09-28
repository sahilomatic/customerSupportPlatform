from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import datetime

class WhatsAppMessageRequest(BaseModel):
    message: str
    column_name: str = "mobile"
    
    @validator('message')
    def message_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty')
        return v

class WhatsAppSingleMessageRequest(BaseModel):
    mobile_number: str
    message: str
    
    @validator('message')
    def message_not_empty(cls, v):
        if not v.strip():
            raise ValueError('Message cannot be empty')
        return v

class MessageResult(BaseModel):
    number: str
    status: str  # success/failed
    message_sid: Optional[str] = None
    error: Optional[str] = None
    timestamp: datetime

class BulkMessageResponse(BaseModel):
    status: str
    total_numbers: int
    successful: int
    failed: int
    invalid_numbers: List[str]
    results: List[MessageResult]
    message_sent: str

class SetupInstructions(BaseModel):
    instructions: List[str]
    sandbox_limitations: List[str]
    excel_format: dict
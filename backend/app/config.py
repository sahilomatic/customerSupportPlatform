from pydantic_settings import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    # Project Info
    PROJECT_NAME: str = "Communication API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Multi-channel communication API"
    
    # Twilio WhatsApp Config
    TWILIO_ACCOUNT_SID: Optional[str] = None
    TWILIO_AUTH_TOKEN: Optional[str] = None
    TWILIO_WHATSAPP_FROM: str = "whatsapp:+14155238886"  # Sandbox number

    # Twilio SMS Config
    TWILIO_PHONE_NUMBER: Optional[str] = None  # Your Twilio phone number for SMS (e.g., +1234567890)
    
    # File Upload Settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_EXTENSIONS: List[str] = ['.xlsx', '.xls', '.csv']
    
    # Rate Limiting
    MESSAGE_DELAY_SECONDS: int = 1  # Delay between messages for trial
    
    # Logging
    LOG_LEVEL: str = "INFO"

    # G-Drive Link
    GDRIVE_LINK: str = "https://drive.google.com/drive/folders/1acrdWqZU6UXjp5UK5Rr8c08hup6T9BYG?usp=drive_link"
    GDRIVE_ALIAS: str = "Upload Your Event Photos/Videos Here"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
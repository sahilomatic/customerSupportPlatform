import os
from pathlib import Path
from pydantic_settings import BaseSettings
from typing import Optional, List

# Get the directory containing this config file
BASE_DIR = Path(__file__).resolve().parent

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

    # JWT Authentication
    JWT_SECRET_KEY: str = "your-secret-key-change-this-in-production"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 480

    class Config:
        env_file = str(BASE_DIR / ".env")
        env_file_encoding = 'utf-8'
        case_sensitive = True
        extra = 'ignore'

settings = Settings()
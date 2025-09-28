from pydantic_settings import BaseSettings
from typing import Optional, List

class Settings(BaseSettings):
    # Project Info
    PROJECT_NAME: str = "Communication API"
    VERSION: str = "1.0.0"
    DESCRIPTION: str = "Multi-channel communication API"
    
    # Twilio WhatsApp Config
    TWILIO_ACCOUNT_SID: Optional[str] = "ACbc4605b05277dade22373380a4056b29"
    TWILIO_AUTH_TOKEN: Optional[str] = "ef6bbb4c13e299762fc1e717527823c6"
    TWILIO_WHATSAPP_FROM: str = "whatsapp:+14155238886"  # Sandbox number
    
    # File Upload Settings
    MAX_FILE_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_FILE_EXTENSIONS: List[str] = ['.xlsx', '.xls', '.csv']
    
    # Rate Limiting
    MESSAGE_DELAY_SECONDS: int = 1  # Delay between messages for trial
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
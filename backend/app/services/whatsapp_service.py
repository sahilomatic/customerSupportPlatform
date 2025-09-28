import asyncio
import logging
from datetime import datetime
from typing import List
from twilio.rest import Client
from twilio.base.exceptions import TwilioException

from app.config import settings
from app.models.whatsapp import MessageResult
from app.utils.validators import MobileNumberValidator

logger = logging.getLogger(__name__)

class WhatsAppService:
    
    def __init__(self):
        if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
            logger.warning("Twilio credentials not set. WhatsApp service will not work.")
            self.client = None
        else:
            self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)
    
    def validate_credentials(self) -> bool:
        """Check if Twilio credentials are configured"""
        #print('self.client',self.client)
        return self.client is not None
    
    async def send_single_message(self, to_number: str, message: str) -> MessageResult:
        """Send WhatsApp message to a single number"""
        if not self.client:
            return MessageResult(
                number=to_number,
                status="failed",
                error="Twilio credentials not configured",
                timestamp=datetime.now()
            )
        
        try:
            whatsapp_to = f"whatsapp:{to_number}"
            
            message_instance = self.client.messages.create(
                body=message,
                from_=settings.TWILIO_WHATSAPP_FROM,
                to=whatsapp_to
            )
            print('to_number',to_number)
            return MessageResult(
                number=str(to_number),
                status="success",
                message_sid=message_instance.sid,
                timestamp=datetime.now()
            )
            
        except TwilioException as e:
            logger.error(f"Twilio error for {to_number}: {str(e)}")
            return MessageResult(
                number=to_number,
                status="failed",
                error=f"Twilio error: {str(e)}",
                timestamp=datetime.now()
            )
        except Exception as e:
            logger.error(f"Failed to send message to {to_number}: {str(e)}")
            return MessageResult(
                number=to_number,
                status="failed",
                error=str(e),
                timestamp=datetime.now()
            )
    
    async def send_bulk_messages(self, numbers: List[str], message: str) -> List[MessageResult]:
        """Send WhatsApp messages to multiple numbers with rate limiting"""
        results = []
        
        for i, number in enumerate(numbers):
            #print('number hai hai:',number)
            result = await self.send_single_message('+91'+number, message)
            #print("result hai hai ", result)
            results.append(result)
            
            # Rate limiting: wait between messages (for trial account)
            if i < len(numbers) - 1:
                await asyncio.sleep(settings.MESSAGE_DELAY_SECONDS)
        
        return results
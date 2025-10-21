import asyncio
import logging
from datetime import datetime
from typing import List, Dict
from twilio.rest import Client
from twilio.base.exceptions import TwilioException

from app.config import settings
from app.utils.validators import MobileNumberValidator

logger = logging.getLogger(__name__)

class SMSService:

    def __init__(self):
        if not settings.TWILIO_ACCOUNT_SID or not settings.TWILIO_AUTH_TOKEN:
            logger.warning("Twilio credentials not set. SMS service will not work.")
            self.client = None
        else:
            self.client = Client(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN)

    def validate_credentials(self) -> bool:
        """Check if Twilio credentials are configured"""
        return self.client is not None

    async def send_single_sms(self, to_number: str, message: str) -> Dict:
        """Send SMS to a single number"""
        if not self.client:
            return {
                "number": to_number,
                "status": "failed",
                "error": "Twilio credentials not configured",
                "timestamp": datetime.now().isoformat()
            }

        try:
            # For SMS, we don't use the whatsapp: prefix
            message_instance = self.client.messages.create(
                body=message,
                from_=settings.TWILIO_PHONE_NUMBER,
                to=to_number
            )

            logger.info(f"SMS sent to {to_number}, SID: {message_instance.sid}")
            return {
                "number": str(to_number),
                "status": "success",
                "sid": message_instance.sid,
                "timestamp": datetime.now().isoformat()
            }

        except TwilioException as e:
            logger.error(f"Twilio error for {to_number}: {str(e)}")
            return {
                "number": to_number,
                "status": "failed",
                "error": f"Twilio error: {str(e)}",
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            logger.error(f"Failed to send SMS to {to_number}: {str(e)}")
            return {
                "number": to_number,
                "status": "failed",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

    async def send_bulk_sms(self, numbers: List[str], message: str) -> List[Dict]:
        """Send SMS to multiple numbers with rate limiting"""
        results = []

        for i, number in enumerate(numbers):
            result = await self.send_single_sms('+91' + number, message)
            results.append(result)

            # Rate limiting: wait between messages (for trial account)
            if i < len(numbers) - 1:
                await asyncio.sleep(settings.MESSAGE_DELAY_SECONDS)

        return results

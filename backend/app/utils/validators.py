import re
import pandas as pd
from typing import Optional

class MobileNumberValidator:
    
    @staticmethod
    def clean_mobile_number(number) -> Optional[str]:
        """Clean and validate mobile number"""
        if pd.isna(number):
            return None
        
        # Convert to string and remove any non-digit characters except +
        number_str = str(number).strip()
        clean_number = re.sub(r'[^\d+]', '', number_str)
        
        # Remove leading zeros and handle Indian numbers
        if clean_number.startswith('0'):
            clean_number = clean_number[1:]
        
        # Add country code if missing (assuming India +91)
        if len(clean_number) == 10 and clean_number.isdigit():
            clean_number = f"+91{clean_number}"
        elif len(clean_number) == 12 and clean_number.startswith('91'):
            clean_number = f"+{clean_number}"
        elif not clean_number.startswith('+'):
            clean_number = f"+91{clean_number}"
        
        # Validate number format
        if re.match(r'^\+\d{10,15}$', clean_number):
            return clean_number
        
        return None

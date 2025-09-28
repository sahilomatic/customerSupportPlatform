import pandas as pd
import re
from typing import List, Tuple, Optional
from fastapi import UploadFile, HTTPException
from io import BytesIO


class MobileNumberValidator:
    @staticmethod
    def clean_mobile_number(number: Optional[str]) -> Optional[str]:
        """
        Clean and validate a mobile number.
        - Keeps only digits
        - Accepts numbers with +91 or 91 prefix
        - Returns a 10-digit string if valid, otherwise None
        """
        if number is None or pd.isna(number):
            return None

        # Convert to string and strip spaces
        number = str(number).strip()

        # Keep only digits
        digits = re.sub(r"\D", "", number)

        # Handle country code +91 or 91
        if digits.startswith("91") and len(digits) > 10:
            digits = digits[-10:]

        # Final validation: must be 10 digits
        if len(digits) == 10:
            return digits

        return None


class ExcelProcessor:

    @staticmethod
    async def read_excel_file(file: UploadFile) -> pd.DataFrame:
        """Read Excel file and return DataFrame"""
        if not file.filename.endswith(('.xlsx', '.xls')):
            raise HTTPException(
                status_code=400,
                detail="File must be Excel format (.xlsx or .xls)"
            )

        try:
            contents = await file.read()
            df = pd.read_excel(BytesIO(contents))  # <-- use BytesIO to read from memory

            if df.empty:
                raise HTTPException(status_code=400, detail="Excel file is empty")

            return df
        except pd.errors.EmptyDataError:
            raise HTTPException(status_code=400, detail="Excel file is empty")
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"Error reading Excel file: {str(e)}"
            )

    @staticmethod
    def extract_mobile_numbers(df: pd.DataFrame, column_name: str) -> Tuple[List[str], List[str]]:
        """Extract and validate mobile numbers from DataFrame"""
        if column_name not in df.columns:
            available_columns = list(df.columns)
            raise HTTPException(
                status_code=400,
                detail=f"Column '{column_name}' not found. Available columns: {available_columns}"
            )

        valid_numbers: List[str] = []
        invalid_numbers: List[str] = []

        for idx, number in enumerate(df[column_name]):
            cleaned = MobileNumberValidator.clean_mobile_number(number)
            if cleaned:
                valid_numbers.append(cleaned)
            else:
                invalid_numbers.append(f"Row {idx + 2}: {number}")  # +2 accounts for header + 1-based index

        return valid_numbers, invalid_numbers

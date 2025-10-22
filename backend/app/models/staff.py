from sqlalchemy import Column, Integer, String, Boolean, DateTime, JSON
from datetime import datetime
from app.database import Base
import bcrypt

class Staff(Base):
    __tablename__ = "staff"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    name = Column(String, nullable=False)
    father_name = Column(String, nullable=False)
    address = Column(String, nullable=False)
    mobile_number = Column(String, nullable=False)
    aadhar_image_path = Column(String, nullable=True)  # Path to uploaded Aadhar card image

    # Role and permissions
    role = Column(String, default="staff")  # 'admin' or 'staff'
    permissions = Column(JSON, default={})  # JSON field for flexible permissions
    is_active = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def set_password(self, password: str):
        """Hash and set the password"""
        salt = bcrypt.gensalt()
        self.password_hash = bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')

    def check_password(self, password: str) -> bool:
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), self.password_hash.encode('utf-8'))

    def to_dict(self):
        """Convert model to dictionary (excluding password)"""
        return {
            "id": self.id,
            "username": self.username,
            "name": self.name,
            "father_name": self.father_name,
            "address": self.address,
            "mobile_number": self.mobile_number,
            "aadhar_image_path": self.aadhar_image_path,
            "role": self.role,
            "permissions": self.permissions,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

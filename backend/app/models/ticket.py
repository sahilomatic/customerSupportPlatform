from sqlalchemy import Column, Integer, String, Text, DateTime, Date
from datetime import datetime
from app.database import Base

class Ticket(Base):
    __tablename__ = "tickets"

    id = Column(Integer, primary_key=True, index=True)
    ticket_number = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    father_name = Column(String, nullable=False)
    address = Column(Text, nullable=False)
    pincode = Column(String, nullable=False)
    mobile_number = Column(String, nullable=False)
    event_date = Column(Date, nullable=False)  # Date of event
    query = Column(Text, nullable=False)
    status = Column(String, default="Open")  # Open, In Progress, Closed
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "ticket_number": self.ticket_number,
            "name": self.name,
            "father_name": self.father_name,
            "address": self.address,
            "pincode": self.pincode,
            "mobile_number": self.mobile_number,
            "event_date": self.event_date.isoformat() if self.event_date else None,
            "query": self.query,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }

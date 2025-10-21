from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel, validator
from typing import List, Optional
from datetime import datetime
import random
import string

from app.database import get_db, engine, Base
from app.models.ticket import Ticket

router = APIRouter()

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic models
class TicketCreate(BaseModel):
    name: str
    father_name: str
    address: str
    pincode: str
    mobile_number: str
    event_date: str  # Date in YYYY-MM-DD format
    query: str

    @validator('name', 'father_name', 'query')
    def not_empty(cls, v):
        if not v.strip():
            raise ValueError('Field cannot be empty')
        return v

    @validator('pincode')
    def validate_pincode(cls, v):
        if not v.isdigit() or len(v) != 6:
            raise ValueError('Pincode must be 6 digits')
        return v

    @validator('mobile_number')
    def validate_mobile(cls, v):
        cleaned = ''.join(filter(str.isdigit, v))
        if len(cleaned) < 10 or len(cleaned) > 15:
            raise ValueError('Mobile number must be 10-15 digits')
        return cleaned

    @validator('event_date')
    def validate_event_date(cls, v):
        try:
            datetime.strptime(v, '%Y-%m-%d')
            return v
        except ValueError:
            raise ValueError('Date must be in YYYY-MM-DD format')

class TicketResponse(BaseModel):
    id: int
    ticket_number: str
    name: str
    father_name: str
    address: str
    pincode: str
    mobile_number: str
    event_date: str
    query: str
    status: str
    created_at: str
    updated_at: str

class TicketListResponse(BaseModel):
    total: int
    tickets: List[TicketResponse]

def generate_ticket_number():
    """Generate unique ticket number like TKT-YYYYMMDD-XXXX"""
    date_part = datetime.now().strftime("%Y%m%d")
    random_part = ''.join(random.choices(string.digits, k=4))
    return f"TKT-{date_part}-{random_part}"

@router.post("/create", response_model=TicketResponse)
async def create_ticket(ticket: TicketCreate, db: Session = Depends(get_db)):
    """Create a new ticket"""

    # Generate unique ticket number
    while True:
        ticket_number = generate_ticket_number()
        existing = db.query(Ticket).filter(Ticket.ticket_number == ticket_number).first()
        if not existing:
            break

    # Parse event_date
    from datetime import datetime as dt
    event_date_obj = dt.strptime(ticket.event_date, '%Y-%m-%d').date()

    # Create ticket
    db_ticket = Ticket(
        ticket_number=ticket_number,
        name=ticket.name,
        father_name=ticket.father_name,
        address=ticket.address,
        pincode=ticket.pincode,
        mobile_number=ticket.mobile_number,
        event_date=event_date_obj,
        query=ticket.query,
        status="Open"
    )

    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)

    return TicketResponse(**db_ticket.to_dict())

@router.get("/list", response_model=TicketListResponse)
async def list_tickets(
    status: Optional[str] = None,
    search: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """List all tickets with optional filtering"""

    query = db.query(Ticket)

    # Filter by status
    if status:
        query = query.filter(Ticket.status == status)

    # Search across multiple fields
    if search:
        search_filter = f"%{search}%"
        query = query.filter(
            (Ticket.ticket_number.like(search_filter)) |
            (Ticket.name.like(search_filter)) |
            (Ticket.mobile_number.like(search_filter)) |
            (Ticket.pincode.like(search_filter))
        )

    # Get total count
    total = query.count()

    # Get paginated results, ordered by created_at desc
    tickets = query.order_by(Ticket.created_at.desc()).offset(skip).limit(limit).all()

    return TicketListResponse(
        total=total,
        tickets=[TicketResponse(**ticket.to_dict()) for ticket in tickets]
    )

@router.get("/{ticket_number}", response_model=TicketResponse)
async def get_ticket(ticket_number: str, db: Session = Depends(get_db)):
    """Get a specific ticket by ticket number"""

    ticket = db.query(Ticket).filter(Ticket.ticket_number == ticket_number).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    return TicketResponse(**ticket.to_dict())

@router.patch("/{ticket_number}/status")
async def update_ticket_status(
    ticket_number: str,
    status: str,
    db: Session = Depends(get_db)
):
    """Update ticket status"""

    if status not in ["Open", "In Progress", "Closed"]:
        raise HTTPException(status_code=400, detail="Invalid status")

    ticket = db.query(Ticket).filter(Ticket.ticket_number == ticket_number).first()

    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")

    ticket.status = status
    ticket.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(ticket)

    return TicketResponse(**ticket.to_dict())

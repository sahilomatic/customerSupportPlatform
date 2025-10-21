from fastapi import APIRouter
from app.api.v1 import whatsapp, sms, tickets

api_v1_router = APIRouter()

api_v1_router.include_router(
    whatsapp.router,
    prefix="/whatsapp",
    tags=["WhatsApp"]
)

api_v1_router.include_router(
    sms.router,
    prefix="/sms",
    tags=["SMS"]
)

api_v1_router.include_router(
    tickets.router,
    prefix="/tickets",
    tags=["Tickets"]
)
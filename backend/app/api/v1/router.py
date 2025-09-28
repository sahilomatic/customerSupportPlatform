from fastapi import APIRouter
from app.api.v1 import whatsapp

api_v1_router = APIRouter()

api_v1_router.include_router(
    whatsapp.router,
    prefix="/whatsapp",
    tags=["WhatsApp"]
)
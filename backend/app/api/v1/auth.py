from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
import os
import shutil
from datetime import timedelta

from app.database import get_db
from app.models.staff import Staff
from app.utils.auth import create_access_token, get_current_user, get_current_admin, ACCESS_TOKEN_EXPIRE_MINUTES

router = APIRouter()

# Pydantic models for request/response
class StaffLogin(BaseModel):
    username: str
    password: str

class StaffRegisterResponse(BaseModel):
    id: int
    username: str
    name: str
    message: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: dict

class PermissionUpdate(BaseModel):
    permissions: dict

# Create uploads directory if it doesn't exist
UPLOAD_DIR = "uploads/aadhar_cards"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/register", response_model=StaffRegisterResponse)
async def register_staff(
    username: str = Form(...),
    password: str = Form(...),
    name: str = Form(...),
    father_name: str = Form(...),
    address: str = Form(...),
    mobile_number: str = Form(...),
    aadhar_image: Optional[UploadFile] = File(None),
    db: Session = Depends(get_db)
):
    """
    Register a new staff member
    """
    # Check if username already exists
    existing_user = db.query(Staff).filter(Staff.username == username).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )

    # Save aadhar image if provided
    file_path = None
    if aadhar_image:
        file_extension = os.path.splitext(aadhar_image.filename)[1]
        file_path = os.path.join(UPLOAD_DIR, f"{username}_aadhar{file_extension}")

        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(aadhar_image.file, buffer)

    # Create new staff member
    new_staff = Staff(
        username=username,
        name=name,
        father_name=father_name,
        address=address,
        mobile_number=mobile_number,
        aadhar_image_path=file_path,
        role="staff",  # Default role
        permissions={"view_tickets": False, "manage_tickets": False, "send_messages": False},
        is_active=False  # Inactive until admin approves
    )
    new_staff.set_password(password)

    db.add(new_staff)
    db.commit()
    db.refresh(new_staff)

    return StaffRegisterResponse(
        id=new_staff.id,
        username=new_staff.username,
        name=new_staff.name,
        message="Registration successful. Please wait for admin approval."
    )

@router.post("/login", response_model=TokenResponse)
async def login_staff(
    credentials: StaffLogin,
    db: Session = Depends(get_db)
):
    """
    Staff login endpoint
    """
    # Find user
    user = db.query(Staff).filter(Staff.username == credentials.username).first()

    if not user or not user.check_password(credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is not active. Please wait for admin approval."
        )

    # Create access token
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username, "role": user.role},
        expires_delta=access_token_expires
    )

    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user.to_dict()
    )

@router.get("/me")
async def get_current_user_info(
    current_user: Staff = Depends(get_current_user)
):
    """
    Get current logged-in user information
    """
    return current_user.to_dict()

@router.get("/admin/staff")
async def list_all_staff(
    current_user: Staff = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint: List all staff members
    """
    staff_members = db.query(Staff).all()
    return [staff.to_dict() for staff in staff_members]

@router.patch("/admin/staff/{staff_id}/activate")
async def activate_staff(
    staff_id: int,
    current_user: Staff = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint: Activate a staff member
    """
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found"
        )

    staff.is_active = True
    db.commit()

    return {"message": f"Staff member {staff.name} activated successfully"}

@router.patch("/admin/staff/{staff_id}/deactivate")
async def deactivate_staff(
    staff_id: int,
    current_user: Staff = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint: Deactivate a staff member
    """
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found"
        )

    staff.is_active = False
    db.commit()

    return {"message": f"Staff member {staff.name} deactivated successfully"}

@router.patch("/admin/staff/{staff_id}/permissions")
async def update_staff_permissions(
    staff_id: int,
    permission_update: PermissionUpdate,
    current_user: Staff = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint: Update staff permissions
    """
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found"
        )

    staff.permissions = permission_update.permissions
    db.commit()

    return {"message": f"Permissions updated for {staff.name}", "permissions": staff.permissions}

@router.patch("/admin/staff/{staff_id}/make-admin")
async def make_staff_admin(
    staff_id: int,
    current_user: Staff = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint: Make a staff member an admin
    """
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found"
        )

    staff.role = "admin"
    db.commit()

    return {"message": f"{staff.name} is now an admin"}

@router.get("/admin/staff/{staff_id}/aadhar")
async def view_aadhar_image(
    staff_id: int,
    current_user: Staff = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint: View staff member's Aadhar card image
    """
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found"
        )

    if not staff.aadhar_image_path or not os.path.exists(staff.aadhar_image_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Aadhar card image not found"
        )

    return FileResponse(staff.aadhar_image_path)

@router.delete("/admin/staff/{staff_id}")
async def delete_staff(
    staff_id: int,
    current_user: Staff = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Admin endpoint: Delete a staff member
    """
    staff = db.query(Staff).filter(Staff.id == staff_id).first()
    if not staff:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Staff member not found"
        )

    # Delete aadhar image file if exists
    if staff.aadhar_image_path and os.path.exists(staff.aadhar_image_path):
        os.remove(staff.aadhar_image_path)

    db.delete(staff)
    db.commit()

    return {"message": f"Staff member {staff.name} deleted successfully"}

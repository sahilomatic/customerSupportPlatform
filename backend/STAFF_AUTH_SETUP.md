# Staff Authentication System - Setup Guide

This guide explains how to set up and use the new staff authentication system with role-based access control.

## Features

### Backend Features
- JWT-based authentication
- Staff registration with optional Aadhar card upload
- Role-based access control (Admin/Staff)
- Admin panel for managing staff members
- Granular permissions system
- Secure password hashing with bcrypt

### Frontend Features
- Staff registration page
- Staff login page
- Admin panel for staff management
- Role-based navigation
- Token-based authentication with automatic session management

## Setup Instructions

### 1. Backend Setup

#### Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

#### Initialize Database
Run the database initialization script to create tables and a default admin user:
```bash
python init_db.py
```

This will create:
- All necessary database tables
- A default admin user with credentials:
  - Username: `admin`
  - Password: `admin123`

**⚠️ IMPORTANT:** Change the default admin password after first login!

#### Configure Environment Variables (Optional)
You can customize JWT settings in `app/config.py` or via environment variables:
```
JWT_SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=480
```

#### Start the Backend Server
```bash
python -m app.main
# or
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

### 2. Frontend Setup

#### Install Dependencies
```bash
cd frontend/frontend
npm install
```

#### Configure API URL
Create a `.env` file in the frontend directory:
```
VITE_API_URL=http://localhost:8000
```

#### Start the Development Server
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## Usage Guide

### For Staff Members

#### Registration
1. Navigate to `/staff-register`
2. Fill in the registration form:
   - Username (unique)
   - Full Name
   - Father's Name
   - Mobile Number (10 digits)
   - Address
   - Password
   - Aadhar Card Image (optional)
3. Submit the form
4. Wait for admin approval

#### Login
1. Navigate to `/staff-login`
2. Enter your username and password
3. After successful login, you'll be redirected to the messenger page
4. Access is based on permissions granted by admin

### For Admin Users

#### Login
1. Use the default credentials (or your admin credentials):
   - Username: `admin`
   - Password: `admin123`
2. Navigate to `/admin` or click "Admin Panel" in the navigation

#### Managing Staff
In the Admin Panel, you can:

1. **View All Staff Members**: See a list of all registered staff
2. **Activate/Deactivate Staff**: Enable or disable staff accounts
3. **Manage Permissions**: Grant specific permissions to staff:
   - View Tickets
   - Manage Tickets
   - Send Messages
4. **Make Staff Admin**: Promote staff members to admin role
5. **View Aadhar Cards**: View uploaded Aadhar card images
6. **Delete Staff**: Remove staff members from the system

## API Endpoints

### Authentication Endpoints
- `POST /api/v1/auth/register` - Register new staff member
- `POST /api/v1/auth/login` - Staff login
- `GET /api/v1/auth/me` - Get current user info

### Admin Endpoints (Requires Admin Role)
- `GET /api/v1/auth/admin/staff` - List all staff members
- `PATCH /api/v1/auth/admin/staff/{id}/activate` - Activate staff
- `PATCH /api/v1/auth/admin/staff/{id}/deactivate` - Deactivate staff
- `PATCH /api/v1/auth/admin/staff/{id}/permissions` - Update permissions
- `PATCH /api/v1/auth/admin/staff/{id}/make-admin` - Make staff admin
- `GET /api/v1/auth/admin/staff/{id}/aadhar` - View Aadhar card
- `DELETE /api/v1/auth/admin/staff/{id}` - Delete staff member

## Database Schema

### Staff Table
```sql
- id: Integer (Primary Key)
- username: String (Unique)
- password_hash: String
- name: String
- father_name: String
- address: String
- mobile_number: String
- aadhar_image_path: String (Nullable)
- role: String (admin/staff)
- permissions: JSON
- is_active: Boolean
- created_at: DateTime
- updated_at: DateTime
```

## Security Features

1. **Password Security**: Passwords are hashed using bcrypt
2. **JWT Tokens**: Secure token-based authentication
3. **Role-Based Access**: Different access levels for admin and staff
4. **Account Activation**: New staff accounts require admin approval
5. **Permission System**: Granular control over staff capabilities

## Troubleshooting

### Common Issues

1. **"Token has expired"**
   - Log out and log back in
   - Tokens expire after 8 hours by default

2. **"Account is not active"**
   - New accounts need admin approval
   - Contact your admin to activate your account

3. **"Not enough permissions"**
   - Only admin users can access certain features
   - Check with your admin for proper role assignment

## File Upload Location

Aadhar card images are stored in:
```
backend/uploads/aadhar_cards/
```

Make sure this directory has proper write permissions.

## Notes

- Default admin credentials should be changed immediately after first login
- Keep your JWT_SECRET_KEY secure and never commit it to version control
- Regular staff members cannot access admin endpoints
- Inactive staff members cannot log in
- All authentication requires valid JWT tokens

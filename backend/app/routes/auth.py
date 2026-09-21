from fastapi import APIRouter, HTTPException, Request, Response
from fastapi.responses import JSONResponse
from pydantic import BaseModel
from typing import Optional
import secrets
from datetime import datetime, timedelta
from jose import jwt
from dotenv import load_dotenv
import os

from app.database.mongodb import (
    create_user, get_user_by_email, verify_user_password,
    generate_reset_token, verify_reset_token, reset_password,
    change_password, users_collection
)
from app.services.email_service import email_service

load_dotenv()

router = APIRouter(prefix="/api/auth", tags=["auth"])

# JWT Secret
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

class SignUpRequest(BaseModel):
    email: str
    password: str
    full_name: Optional[str] = None

class LoginRequest(BaseModel):
    email: str
    password: str

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

class ForgotPasswordRequest(BaseModel):
    email: str

class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

def create_access_token(email: str):
    """Create JWT token"""
    expiry = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    payload = {
        "email": email,
        "exp": expiry
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    """Verify JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload.get("email")
    except jwt.JWTError:
        return None

@router.post("/signup")
async def signup(request: SignUpRequest):
    """Register a new user"""
    try:
        # Check if user exists
        existing = get_user_by_email(request.email)
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Create user
        create_user(request.email, request.password, request.full_name)
        
        return {
            "success": True,
            "message": "User created successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Signup error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/login")
async def login(request: LoginRequest):
    """Login user"""
    try:
        user = verify_user_password(request.email, request.password)
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Create token
        token = create_access_token(user["email"])
        
        return {
            "success": True,
            "message": "Login successful",
            "data": {
                "token": token,
                "user": {
                    "email": user["email"],
                    "full_name": user.get("full_name"),
                    "created_at": user.get("created_at")
                }
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Login error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/logout")
async def logout():
    """Logout user (client-side token removal)"""
    return {
        "success": True,
        "message": "Logout successful"
    }

@router.post("/forgot-password")
async def forgot_password(request: ForgotPasswordRequest):
    """Generate password reset token and send email"""
    try:
        user = get_user_by_email(request.email)
        if not user:
            # Don't reveal if user exists or not for security
            return {
                "success": True,
                "message": "If your email is registered, you will receive a reset link"
            }
        
        token = generate_reset_token(request.email)
        
        # Send email
        sent = await email_service.send_reset_password_email(request.email, token)
        
        if sent:
            return {
                "success": True,
                "message": "Reset link has been sent to your email"
            }
        else:
            # Still return success to not reveal email configuration
            print(f"⚠️ Email sending failed for {request.email}, but token was generated: {token}")
            return {
                "success": True,
                "message": "If your email is registered, you will receive a reset link"
            }
            
    except Exception as e:
        print(f"❌ Forgot password error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/reset-password")
async def reset_password_confirm(request: ResetPasswordRequest):
    """Confirm password reset"""
    try:
        success = reset_password(request.token, request.new_password)
        if not success:
            raise HTTPException(status_code=400, detail="Invalid or expired token")
        
        return {
            "success": True,
            "message": "Password reset successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Reset password error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/change-password")
async def change_password_endpoint(request: ChangePasswordRequest, req: Request):
    """Change user password"""
    try:
        # Get token from Authorization header
        auth_header = req.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        token = auth_header.split(" ")[1]
        email = verify_token(token)
        if not email:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        success = change_password(email, request.current_password, request.new_password)
        if not success:
            raise HTTPException(status_code=400, detail="Current password is incorrect")
        
        return {
            "success": True,
            "message": "Password changed successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Change password error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/me")
async def get_current_user(req: Request):
    """Get current user info"""
    try:
        auth_header = req.headers.get("Authorization")
        if not auth_header or not auth_header.startswith("Bearer "):
            raise HTTPException(status_code=401, detail="Unauthorized")
        
        token = auth_header.split(" ")[1]
        email = verify_token(token)
        if not email:
            raise HTTPException(status_code=401, detail="Invalid or expired token")
        
        user = get_user_by_email(email)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "success": True,
            "data": {
                "email": user["email"],
                "full_name": user.get("full_name"),
                "created_at": user.get("created_at")
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Get user error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
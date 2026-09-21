from datetime import datetime
from typing import Optional
from pydantic import BaseModel, EmailStr

class User(BaseModel):
    email: EmailStr
    password_hash: str
    full_name: Optional[str] = None
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    is_active: bool = True
    reset_token: Optional[str] = None
    reset_token_expiry: Optional[datetime] = None

class UserCreate(BaseModel):
    email: EmailStr
    password: str
    full_name: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserChangePassword(BaseModel):
    current_password: str
    new_password: str

class UserResetPassword(BaseModel):
    email: EmailStr

class UserResetPasswordConfirm(BaseModel):
    token: str
    new_password: str
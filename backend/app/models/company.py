from typing import List, Optional
from datetime import datetime
from pydantic import BaseModel

class Company(BaseModel):
    name: str
    domain: str
    keywords: List[str] = []
    created_at: datetime = datetime.utcnow()
    updated_at: datetime = datetime.utcnow()
    is_active: bool = True

class CompanyCreate(BaseModel):
    name: str
    domain: str
    keywords: List[str] = []

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    keywords: Optional[List[str]] = None
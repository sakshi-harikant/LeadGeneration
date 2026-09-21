from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from app.database.mongodb import (
    get_all_companies, get_company_by_domain, create_company,
    update_company, delete_company, init_companies
)

router = APIRouter(prefix="/api/companies", tags=["companies"])

class CompanyCreate(BaseModel):
    name: str
    domain: str
    keywords: List[str] = []

class CompanyUpdate(BaseModel):
    name: Optional[str] = None
    domain: Optional[str] = None
    keywords: Optional[List[str]] = None

@router.get("/init")
async def initialize_companies():
    """Initialize default companies"""
    init_companies()
    return {
        "success": True,
        "message": "Companies initialized"
    }

@router.get("/")
async def get_companies():
    """Get all companies"""
    try:
        companies = get_all_companies()
        # Convert ObjectId to string
        for company in companies:
            company["_id"] = str(company["_id"])
        return {
            "success": True,
            "data": companies
        }
    except Exception as e:
        print(f"❌ Error getting companies: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/{domain}")
async def get_company(domain: str):
    """Get company by domain"""
    try:
        company = get_company_by_domain(domain)
        if not company:
            raise HTTPException(status_code=404, detail="Company not found")
        company["_id"] = str(company["_id"])
        return {
            "success": True,
            "data": company
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error getting company: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/")
async def add_company(request: CompanyCreate):
    """Add a new company"""
    try:
        existing = get_company_by_domain(request.domain)
        if existing:
            raise HTTPException(status_code=400, detail="Company already exists")
        
        result = create_company(request.name, request.domain, request.keywords)
        return {
            "success": True,
            "message": "Company created successfully",
            "data": {"id": str(result.inserted_id)}
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error creating company: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/{domain}")
async def update_company_endpoint(domain: str, request: CompanyUpdate):
    """Update company by domain"""
    try:
        updates = request.dict(exclude_unset=True)
        if not updates:
            raise HTTPException(status_code=400, detail="No updates provided")
        
        # If domain is being updated, check if new domain exists
        if "domain" in updates:
            existing = get_company_by_domain(updates["domain"])
            if existing and existing["domain"] != domain.lower():
                raise HTTPException(status_code=400, detail="Domain already taken")
        
        result = update_company(domain, updates)
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Company not found")
        
        return {
            "success": True,
            "message": "Company updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error updating company: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/{domain}")
async def delete_company_endpoint(domain: str):
    """Delete company by domain"""
    try:
        result = delete_company(domain)
        if result.deleted_count == 0:
            raise HTTPException(status_code=404, detail="Company not found")
        
        return {
            "success": True,
            "message": "Company deleted successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"❌ Error deleting company: {e}")
        raise HTTPException(status_code=500, detail=str(e))
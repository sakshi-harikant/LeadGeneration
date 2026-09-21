from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional
from app.services.lead_service import lead_service
from app.database.mongodb import leads_collection

# Create router
router = APIRouter(prefix="/api/leads", tags=["leads"])

# Request models
class DomainSearchRequest(BaseModel):
    domain: str
    keyword: Optional[str] = None


class EmailFinderRequest(BaseModel):
    domain: str
    firstName: str
    lastName: str


class EmailVerifyRequest(BaseModel):
    email: str


@router.post("/search/domain")
async def search_domain(request: DomainSearchRequest):
    """Search for contacts at a domain with optional keyword filtering"""
    try:
        print(f"\n🔍 Domain search request: {request.domain}")
        saved_contacts = await lead_service.search_and_save(request.domain, request.keyword)
        
        return {
            "success": True,
            "message": f"Found {len(saved_contacts)} contacts",
            "data": saved_contacts,
            "count": len(saved_contacts)
        }
    except Exception as e:
        print(f"❌ Error in search_domain: {e}")
        import traceback
        traceback.print_exc()
        return {
            "success": False,
            "message": str(e),
            "data": [],
            "count": 0
        }


@router.post("/search/person")
async def search_person(request: EmailFinderRequest):
    """Find email for a specific person at a domain"""
    try:
        from app.services.hunter_service import hunter_service
        
        print(f"\n🔍 Finding person: {request.firstName} {request.lastName} @ {request.domain}")
        hunter_response = await hunter_service.email_finder(
            request.domain, 
            request.firstName, 
            request.lastName
        )
        
        if "data" in hunter_response and "email" in hunter_response["data"]:
            email_data = hunter_response["data"]
            
            contact = {
                "name": f"{request.firstName} {request.lastName}",
                "firstName": request.firstName,
                "lastName": request.lastName,
                "email": email_data.get("email"),
                "jobTitle": email_data.get("title"),
                "company": email_data.get("company"),
                "companyDomain": request.domain,
                "emailStatus": email_data.get("verification", {}).get("status", "unknown"),
                "emailConfidence": email_data.get("verification", {}).get("score", 0),
                "source": "Hunter"
            }
            
            saved = await lead_service._save_contact(contact)
            
            return {
                "success": True,
                "message": "Found contact",
                "data": [saved] if saved else []
            }
        
        return {
            "success": False,
            "message": "No email found",
            "data": []
        }
    except Exception as e:
        print(f"❌ Error in search_person: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/verify-email")
async def verify_email(request: EmailVerifyRequest):
    """Verify an email address"""
    try:
        from app.services.hunter_service import hunter_service
        
        print(f"\n🔍 Verifying email: {request.email}")
        hunter_response = await hunter_service.email_verifier(request.email)
        
        if "data" in hunter_response:
            return {
                "success": True,
                "data": hunter_response["data"]
            }
        return {
            "success": False,
            "message": "Verification failed"
        }
    except Exception as e:
        print(f"❌ Error in verify_email: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/")
async def get_all_leads(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000)
):
    """Get all leads with pagination"""
    try:
        leads = await lead_service.get_all_leads(skip, limit)
        stats = await lead_service.get_lead_stats()
        
        return {
            "success": True,
            "data": leads,
            "total": stats["totalLeads"],
            "skip": skip,
            "limit": limit
        }
    except Exception as e:
        print(f"❌ Error in get_all_leads: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/stats")
async def get_stats():
    """Get lead statistics"""
    try:
        stats = await lead_service.get_lead_stats()
        return {
            "success": True,
            "data": stats
        }
    except Exception as e:
        print(f"❌ Error in get_stats: {e}")
        return {
            "success": False,
            "data": {
                "totalLeads": 0,
                "uniqueLeads": 0,
                "companies": 0,
                "verifiedEmails": 0,
                "invalidEmails": 0,
                "riskyEmails": 0,
                "unknownEmails": 0
            }
        }


@router.get("/{lead_id}")
async def get_lead(lead_id: str):
    """Get a single lead by ID"""
    try:
        from bson import ObjectId
        
        lead = leads_collection.find_one({"_id": ObjectId(lead_id)})
        if lead:
            lead["_id"] = str(lead["_id"])
            return {
                "success": True,
                "data": lead
            }
        return {
            "success": False,
            "message": "Lead not found"
        }
    except Exception as e:
        print(f"❌ Error in get_lead: {e}")
        return {
            "success": False,
            "message": str(e)
        }


@router.delete("/{lead_id}")
async def delete_lead(lead_id: str):
    """Delete a lead by ID"""
    try:
        from bson import ObjectId
        
        result = leads_collection.delete_one({"_id": ObjectId(lead_id)})
        if result.deleted_count > 0:
            return {
                "success": True,
                "message": "Lead deleted successfully"
            }
        return {
            "success": False,
            "message": "Lead not found"
        }
    except Exception as e:
        print(f"❌ Error in delete_lead: {e}")
        return {
            "success": False,
            "message": str(e)
        }
from typing import List, Dict, Any, Optional
from datetime import datetime
from app.database.mongodb import leads_collection
from app.services.hunter_service import hunter_service
from app.services.apollo_service import apollo_service


class LeadService:
    def __init__(self):
        pass
    
    async def search_and_save(self, domain: str, keyword: str = None) -> List[Dict[str, Any]]:
        """Search for leads using Hunter and save to MongoDB"""
        
        saved_contacts = []
        contacts = []
        
        try:
            print(f"\n🔍 Searching Hunter for: {domain}")
            hunter_response = await hunter_service.domain_search(domain)
            
            # Check if Hunter returned data
            if "data" in hunter_response and "emails" in hunter_response["data"]:
                emails = hunter_response["data"]["emails"]
                print(f"📧 Hunter found {len(emails)} emails")
                
                for email_data in emails:
                    contact = self._create_contact_from_hunter(email_data, domain)
                    if contact and contact.get("email"):
                        contacts.append(contact)
                        print(f"  ✅ Hunter: {contact.get('name')} - {contact.get('email')}")
                    else:
                        print(f"  ⚠️ Skipping contact with no email: {email_data}")
            else:
                print(f"⚠️ No emails found in Hunter response")
                print(f"   Response keys: {list(hunter_response.keys())}")
                if "data" in hunter_response:
                    print(f"   Data keys: {list(hunter_response['data'].keys())}")
            
            # Filter by keyword if provided
            if keyword and keyword.strip():
                contacts = self.filter_by_job_title(contacts, keyword)
                print(f"🎯 Filtered to {len(contacts)} contacts matching '{keyword}'")
            else:
                print(f"📋 No keyword filter - showing all {len(contacts)} contacts")
            
            # Save each contact to MongoDB
            print(f"💾 Attempting to save {len(contacts)} contacts to MongoDB...")
            for contact in contacts:
                saved = await self._save_contact(contact)
                if saved:
                    saved_contacts.append(saved)
                    print(f"  ✅ Saved: {contact.get('email')}")
                else:
                    print(f"  ❌ Failed to save: {contact.get('email', 'No email')}")
            
            print(f"✅ Successfully saved {len(saved_contacts)} contacts")
            return saved_contacts
            
        except Exception as e:
            print(f"❌ Error in search_and_save: {e}")
            import traceback
            traceback.print_exc()
            return []
    
    def filter_by_job_title(self, contacts: List[Dict[str, Any]], keyword: str) -> List[Dict[str, Any]]:
        """Filter contacts by job title keyword"""
        if not keyword or keyword.strip() == "":
            return contacts
        
        keyword_lower = keyword.lower()
        filtered = []
        
        for contact in contacts:
            job_title = contact.get("jobTitle", "").lower()
            if keyword_lower in job_title:
                filtered.append(contact)
            else:
                print(f"  ⏭️ Skipping {contact.get('name', 'Unknown')} - '{contact.get('jobTitle', 'N/A')}' doesn't match '{keyword}'")
        
        return filtered
    
    def _create_contact_from_hunter(self, email_data: Dict[str, Any], domain: str) -> Dict[str, Any]:
        """Create contact from Hunter response"""
        now = datetime.utcnow().isoformat()
        
        # Extract data from Hunter response
        email = email_data.get("value") or email_data.get("email")
        first_name = email_data.get("first_name") or ""
        last_name = email_data.get("last_name") or ""
        name = email_data.get("full_name") or email_data.get("name") or f"{first_name} {last_name}".strip()
        job_title = email_data.get("position") or email_data.get("title")
        company = email_data.get("organization") or domain
        
        # Extract verification status
        verification = email_data.get("verification", {})
        if isinstance(verification, dict):
            status = verification.get("status") or "unknown"
        else:
            status = "unknown"
        
        linkedin = email_data.get("linkedin")
        
        return {
            "name": name or None,
            "firstName": first_name or None,
            "lastName": last_name or None,
            "jobTitle": job_title or None,
            "company": company or None,
            "companyDomain": domain or None,
            "email": email or None,
            "emailStatus": status or "unknown",
            "emailConfidence": 0,
            "phone": None,
            "linkedinUrl": linkedin or None,
            "website": None,
            "location": None,
            "source": "Hunter",
            "createdAt": now,
            "updatedAt": now
        }
    
    async def _save_contact(self, contact: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Save a single contact to MongoDB"""
        try:
            if not contact.get("email"):
                print("  ⚠️ Skipping contact with no email")
                return None
            
            now = datetime.utcnow().isoformat()
            contact["updatedAt"] = now
            
            # Check if contact with same email exists
            existing = leads_collection.find_one({"email": contact["email"].lower()})
            if existing:
                print(f"  🔄 Updating existing contact: {contact['email']}")
                # Update existing contact
                for key in contact:
                    if contact[key] is None and key in existing:
                        contact[key] = existing[key]
                
                leads_collection.update_one(
                    {"email": contact["email"].lower()},
                    {"$set": contact}
                )
                contact["_id"] = str(existing["_id"])
                return contact
            
            # Insert new contact
            print(f"  ✨ Inserting new contact: {contact['email']}")
            result = leads_collection.insert_one(contact)
            if result.inserted_id:
                contact["_id"] = str(result.inserted_id)
                print(f"  ✅ Inserted with ID: {result.inserted_id}")
                return contact
            
            print(f"  ❌ Insert returned no ID")
            return None
            
        except Exception as e:
            print(f"  ❌ Error saving contact {contact.get('email', 'Unknown')}: {e}")
            return None
    
    async def get_all_leads(self, skip: int = 0, limit: int = 100) -> List[Dict[str, Any]]:
        """Get all leads with pagination"""
        try:
            leads = list(leads_collection.find().skip(skip).limit(limit))
            for lead in leads:
                lead["_id"] = str(lead["_id"])
            return leads
        except Exception as e:
            print(f"❌ Error getting leads: {e}")
            return []
    
    async def get_lead_stats(self) -> Dict[str, Any]:
        """Get lead statistics"""
        try:
            if leads_collection is None:
                return {"totalLeads": 0, "uniqueLeads": 0, "companies": 0, "verifiedEmails": 0, "invalidEmails": 0, "riskyEmails": 0, "unknownEmails": 0}
            
            total = leads_collection.count_documents({})
            verified = leads_collection.count_documents({"emailStatus": "verified"})
            valid = leads_collection.count_documents({"emailStatus": "valid"})
            invalid = leads_collection.count_documents({"emailStatus": "invalid"})
            
            try:
                companies = len(leads_collection.distinct("company"))
            except:
                companies = 0
            
            return {
                "totalLeads": total,
                "uniqueLeads": total,
                "companies": companies,
                "verifiedEmails": verified + valid,
                "invalidEmails": invalid,
                "riskyEmails": 0,
                "unknownEmails": total - verified - valid - invalid
            }
        except Exception as e:
            print(f"❌ Error getting stats: {e}")
            return {"totalLeads": 0, "uniqueLeads": 0, "companies": 0, "verifiedEmails": 0, "invalidEmails": 0, "riskyEmails": 0, "unknownEmails": 0}


lead_service = LeadService()
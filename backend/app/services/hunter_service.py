import os
import httpx
from dotenv import load_dotenv
from typing import Optional, Dict, Any, List

load_dotenv()

class HunterService:
    def __init__(self):
        self.api_key = os.getenv("HUNTER_API_KEY")
        self.base_url = "https://api.hunter.io/v2"
        
        if not self.api_key:
            raise ValueError("HUNTER_API_KEY not found in environment variables")
    
    async def domain_search(self, domain: str) -> Dict[str, Any]:
        """Search for contacts at a specific domain"""
        url = f"{self.base_url}/domain-search"
        params = {
            "domain": domain,
            "api_key": self.api_key
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            data = response.json()
            
            # DEBUG: Print the response structure
            print(f"\n🔍 Hunter Response for {domain}:")
            print(f"  Status: {response.status_code}")
            print(f"  Keys: {list(data.keys())}")
            if "data" in data and "emails" in data["data"]:
                emails = data["data"]["emails"]
                print(f"  Number of emails: {len(emails)}")
                if len(emails) > 0:
                    print(f"  First email keys: {list(emails[0].keys())}")
                    print(f"  First email sample: {emails[0]}")
            else:
                print("  No emails found in response")
                print(f"  Response data: {data.get('data', {})}")
            
            return data
    
    async def email_finder(self, domain: str, first_name: str, last_name: str) -> Dict[str, Any]:
        """Find email for a specific person at a domain"""
        url = f"{self.base_url}/email-finder"
        params = {
            "domain": domain,
            "first_name": first_name,
            "last_name": last_name,
            "api_key": self.api_key
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            return response.json()
    
    async def email_verifier(self, email: str) -> Dict[str, Any]:
        """Verify an email address"""
        url = f"{self.base_url}/email-verifier"
        params = {
            "email": email,
            "api_key": self.api_key
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            return response.json()
    
    async def company_enrichment(self, domain: str) -> Dict[str, Any]:
        """Get company information from domain"""
        url = f"{self.base_url}/companies/find"
        params = {
            "domain": domain,
            "api_key": self.api_key
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            return response.json()
    
    async def person_enrichment(self, email: str) -> Dict[str, Any]:
        """Get person information from email"""
        url = f"{self.base_url}/people/find"
        params = {
            "email": email,
            "api_key": self.api_key
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.get(url, params=params)
            return response.json()

# Create a single instance
hunter_service = HunterService()
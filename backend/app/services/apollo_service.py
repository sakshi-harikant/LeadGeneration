import os
import httpx
from dotenv import load_dotenv
from typing import Dict, Any, Optional

load_dotenv()

class ApolloService:
    def __init__(self):
        self.api_key = os.getenv("APOLLO_API_KEY")
        self.base_url = "https://api.apollo.io/v1"
        
        if not self.api_key:
            print("⚠️ APOLLO_API_KEY not found - Apollo features disabled")
            self.api_key = None
    
    async def search_people(self, domain: str, title: str = None) -> Dict[str, Any]:
        """Search for people at a company using Apollo"""
        if not self.api_key:
            print("⚠️ Apollo API key not configured")
            return {"people": [], "error": "No API key"}
        
        # Try different search endpoints
        endpoints = [
            f"{self.base_url}/people/search",
            f"{self.base_url}/search/people"
        ]
        
        headers = {
            "X-Api-Key": self.api_key,
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
        
        payload = {
            "organization_domains": [domain],
            "page": 1,
            "per_page": 25,
            "q_organization_domains": domain
        }
        
        if title:
            payload["titles"] = [title]
            payload["q_titles"] = title
        
        print(f"🔍 Apollo search: domain={domain}, title={title}")
        
        for endpoint in endpoints:
            try:
                async with httpx.AsyncClient() as client:
                    response = await client.post(
                        endpoint, 
                        json=payload, 
                        headers=headers, 
                        timeout=15.0
                    )
                    
                    print(f"📡 Apollo response status: {response.status_code}")
                    
                    if response.status_code == 200:
                        data = response.json()
                        print(f"📡 Apollo response keys: {list(data.keys())}")
                        
                        # Try different response structures
                        people = []
                        if "people" in data:
                            people = data["people"]
                        elif "contacts" in data:
                            people = data["contacts"]
                        elif "results" in data:
                            people = data["results"]
                        elif "data" in data and "people" in data["data"]:
                            people = data["data"]["people"]
                        elif "data" in data and "contacts" in data["data"]:
                            people = data["data"]["contacts"]
                        
                        print(f"📧 Apollo found {len(people)} people")
                        
                        # Log first person for debugging
                        if len(people) > 0:
                            print(f"📧 First person: {people[0].get('name', 'Unknown')}")
                        
                        return {"people": people}
                    else:
                        print(f"⚠️ Apollo error: {response.status_code} - {response.text[:200]}")
                        
            except Exception as e:
                print(f"⚠️ Apollo endpoint {endpoint} failed: {e}")
                continue
        
        return {"people": [], "error": "All endpoints failed"}

# Create a single instance
apollo_service = ApolloService()
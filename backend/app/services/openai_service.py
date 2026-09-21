import os
import json
import httpx
from typing import List, Dict, Any
from dotenv import load_dotenv
from app.services.ai_service import AIService, get_lead_schema

load_dotenv()

class OpenAIService(AIService):
    def __init__(self):
        self.api_key = os.getenv("OPENAI_API_KEY")
        if not self.api_key:
            raise ValueError("OPENAI_API_KEY not found in environment variables")
        
        self.url = "https://api.openai.com/v1/chat/completions"
        self.model = "gpt-3.5-turbo"  # or "gpt-4" if you have access
    
    async def structure_contacts(self, hunter_response: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Send Hunter response to OpenAI for structuring"""
        
        prompt = self._build_prompt(hunter_response)
        
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": "You are a data normalization assistant. Return only valid JSON."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.1,
            "max_tokens": 2048
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(self.url, json=payload, headers=headers, timeout=30.0)
                response.raise_for_status()
                data = response.json()
                
                text = data.get("choices", [{}])[0].get("message", {}).get("content", "[]")
                
                text = text.strip()
                if text.startswith("```json"):
                    text = text[7:]
                if text.endswith("```"):
                    text = text[:-3]
                text = text.strip()
                
                structured_contacts = json.loads(text)
                
                if not isinstance(structured_contacts, list):
                    structured_contacts = [structured_contacts]
                
                validated_contacts = []
                for contact in structured_contacts:
                    validated = self._validate_contact(contact)
                    if validated:
                        validated_contacts.append(validated)
                
                return validated_contacts
                
        except Exception as e:
            print(f"Error calling OpenAI API: {e}")
            return []
    
    def _build_prompt(self, hunter_response: Dict[str, Any]) -> str:
        """Build the prompt for OpenAI"""
        schema = get_lead_schema()
        schema_keys = list(schema.keys())
        
        return f"""
You are a data normalization assistant for a Lead Generation System.

Convert the provided Hunter API response into a structured list of professional contacts.

Return ONLY valid JSON. Do not include any other text.

For each contact, return a JSON object with the following fields:
{json.dumps(schema_keys, indent=2)}

Rules:
1. Use ONLY information present in the supplied Hunter response
2. Do NOT guess, invent, or create any information
3. Do NOT create missing email addresses, phone numbers, or URLs
4. If information is unavailable, return null
5. Preserve Hunter's original verification status and confidence values
6. The 'source' field should always be "Hunter"
7. Return the data as a JSON array (list of contacts)

Here is the Hunter API response:
{json.dumps(hunter_response, indent=2)}

Now return ONLY the JSON array with the structured contacts.
"""
    
    def _validate_contact(self, contact: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and clean a single contact"""
        schema = get_lead_schema()
        validated = {}
        
        for key, default_value in schema.items():
            if key in contact and contact[key] is not None:
                value = contact[key]
                if key == "email" and value:
                    validated[key] = str(value).lower().strip()
                elif isinstance(value, str):
                    validated[key] = value.strip()
                else:
                    validated[key] = value
            else:
                validated[key] = default_value
        
        validated["source"] = "Hunter"
        return validated
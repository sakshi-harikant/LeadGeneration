import os
import json
import httpx
from typing import List, Dict, Any
from dotenv import load_dotenv
from app.services.ai_service import AIService, get_lead_schema

load_dotenv()

class GeminiService(AIService):
    def __init__(self):
        self.api_key = os.getenv("GEMINI_API_KEY")
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY not found in environment variables")
        
        # Gemini API endpoint
        self.url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={self.api_key}"
    
    async def structure_contacts(self, hunter_response: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Send Hunter response to Gemini for structuring"""
        
        # Build the prompt for Gemini
        prompt = self._build_prompt(hunter_response)
        
        # Prepare the request
        payload = {
            "contents": [
                {
                    "parts": [
                        {"text": prompt}
                    ]
                }
            ],
            "generationConfig": {
                "temperature": 0.1,
                "topK": 1,
                "topP": 1,
                "maxOutputTokens": 2048,
            }
        }
        
        try:
            async with httpx.AsyncClient() as client:
                response = await client.post(self.url, json=payload, timeout=30.0)
                response.raise_for_status()
                data = response.json()
                
                # Extract the text from Gemini's response
                text = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "[]")
                
                # Clean up the response
                text = text.strip()
                if text.startswith("```json"):
                    text = text[7:]
                if text.endswith("```"):
                    text = text[:-3]
                text = text.strip()
                
                # Parse JSON
                structured_contacts = json.loads(text)
                
                # Ensure we have a list
                if not isinstance(structured_contacts, list):
                    structured_contacts = [structured_contacts]
                
                # Validate and clean each contact
                validated_contacts = []
                for contact in structured_contacts:
                    validated = self._validate_contact(contact)
                    if validated:
                        validated_contacts.append(validated)
                
                return validated_contacts
                
        except Exception as e:
            print(f"Error calling Gemini API: {e}")
            return []
    
    def _build_prompt(self, hunter_response: Dict[str, Any]) -> str:
        """Build the prompt for Gemini"""
        schema = get_lead_schema()
        schema_keys = list(schema.keys())
        
        prompt = f"""
You are a data normalization assistant for a Lead Generation System.

Convert the provided Hunter API response into a structured list of professional contacts.

RETURN ONLY VALID JSON. Do not include any other text.

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
        return prompt
    
    def _validate_contact(self, contact: Dict[str, Any]) -> Dict[str, Any]:
        """Validate and clean a single contact"""
        schema = get_lead_schema()
        validated = {}
        
        # Only include fields that exist in our schema
        for key, default_value in schema.items():
            if key in contact and contact[key] is not None:
                value = contact[key]
                # Clean email (lowercase)
                if key == "email" and value:
                    validated[key] = str(value).lower().strip()
                # Clean strings
                elif isinstance(value, str):
                    validated[key] = value.strip()
                else:
                    validated[key] = value
            else:
                validated[key] = default_value
        
        # Ensure source is always Hunter
        validated["source"] = "Hunter"
        
        return validated
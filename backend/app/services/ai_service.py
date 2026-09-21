from abc import ABC, abstractmethod
from typing import List, Dict, Any
import os
import json
from dotenv import load_dotenv

load_dotenv()

class AIService(ABC):
    """Abstract base class for AI services"""
    
    @abstractmethod
    async def structure_contacts(self, hunter_response: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Structure raw Hunter response into standardized contact format"""
        pass
    
    def get_provider(self) -> str:
        """Get the current AI provider name"""
        return os.getenv("AI_PROVIDER", "unknown")

def get_ai_service() -> AIService:
    """Factory function to get the appropriate AI service based on configuration"""
    provider = os.getenv("AI_PROVIDER", "gemini").lower()
    
    if provider == "gemini":
        from app.services.gemini_service import GeminiService
        return GeminiService()
    elif provider == "openai":
        from app.services.openai_service import OpenAIService
        return OpenAIService()
    else:
        raise ValueError(f"Unsupported AI provider: {provider}")

# Standard lead schema template
def get_lead_schema() -> Dict[str, Any]:
    """Return the standard lead schema structure"""
    return {
        "name": None,
        "firstName": None,
        "lastName": None,
        "jobTitle": None,
        "company": None,
        "companyDomain": None,
        "email": None,
        "emailStatus": None,
        "emailConfidence": None,
        "phone": None,
        "linkedinUrl": None,
        "website": None,
        "location": None,
        "source": "Hunter",
        "createdAt": None,
        "updatedAt": None
    }
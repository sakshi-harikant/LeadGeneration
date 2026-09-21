import os
from pymongo import MongoClient
from dotenv import load_dotenv
from datetime import datetime
from werkzeug.security import generate_password_hash, check_password_hash
import secrets

load_dotenv()

# Get MongoDB URI
MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise ValueError("MONGODB_URI not found in environment variables")

# Create MongoDB client
client = MongoClient(MONGODB_URI)

# Database
db = client["lead_generation"]

# Collections
users_collection = db["users"]
companies_collection = db["companies"]
leads_collection = db["leads"]

# Create indexes
def create_indexes():
    try:
        # Users
        users_collection.create_index("email", unique=True)
        users_collection.create_index("reset_token")
        
        # Companies
        companies_collection.create_index("domain", unique=True)
        companies_collection.create_index("name")
        
        # Leads
        leads_collection.create_index("email", unique=False)
        leads_collection.create_index("companyDomain")
        leads_collection.create_index("company")
        leads_collection.create_index("name")
        
        print("✅ MongoDB indexes created successfully")
    except Exception as e:
        print(f"⚠️ Error creating indexes: {e}")

def test_connection():
    try:
        client.admin.command('ping')
        print("✅ MongoDB connection successful!")
        return True
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")
        return False

# User functions
def create_user(email: str, password: str, full_name: str = None):
    """Create a new user with hashed password"""
    password_hash = generate_password_hash(password)
    user = {
        "email": email.lower(),
        "password_hash": password_hash,
        "full_name": full_name,
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "is_active": True,
        "reset_token": None,
        "reset_token_expiry": None
    }
    return users_collection.insert_one(user)

def get_user_by_email(email: str):
    """Get user by email"""
    return users_collection.find_one({"email": email.lower()})

def verify_user_password(email: str, password: str):
    """Verify user password"""
    user = get_user_by_email(email)
    if user and check_password_hash(user["password_hash"], password):
        return user
    return None

def generate_reset_token(email: str):
    """Generate password reset token"""
    token = secrets.token_urlsafe(32)
    expiry = datetime.utcnow().isoformat()
    # Set expiry to 1 hour from now
    from datetime import timedelta
    expiry_dt = datetime.utcnow() + timedelta(hours=1)
    
    users_collection.update_one(
        {"email": email.lower()},
        {"$set": {
            "reset_token": token,
            "reset_token_expiry": expiry_dt.isoformat()
        }}
    )
    return token

def verify_reset_token(token: str):
    """Verify reset token and return user"""
    from datetime import datetime
    user = users_collection.find_one({
        "reset_token": token,
        "reset_token_expiry": {"$gt": datetime.utcnow().isoformat()}
    })
    return user

def reset_password(token: str, new_password: str):
    """Reset password using token"""
    user = verify_reset_token(token)
    if not user:
        return False
    
    password_hash = generate_password_hash(new_password)
    users_collection.update_one(
        {"_id": user["_id"]},
        {"$set": {
            "password_hash": password_hash,
            "reset_token": None,
            "reset_token_expiry": None,
            "updated_at": datetime.utcnow().isoformat()
        }}
    )
    return True

def change_password(email: str, current_password: str, new_password: str):
    """Change user password"""
    user = verify_user_password(email, current_password)
    if not user:
        return False
    
    password_hash = generate_password_hash(new_password)
    users_collection.update_one(
        {"email": email.lower()},
        {"$set": {
            "password_hash": password_hash,
            "updated_at": datetime.utcnow().isoformat()
        }}
    )
    return True

# Company functions
def get_all_companies():
    """Get all companies"""
    return list(companies_collection.find())

def get_company_by_domain(domain: str):
    """Get company by domain"""
    return companies_collection.find_one({"domain": domain.lower()})

def create_company(name: str, domain: str, keywords: list = None):
    """Create a new company"""
    company = {
        "name": name,
        "domain": domain.lower(),
        "keywords": keywords or [],
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
        "is_active": True
    }
    return companies_collection.insert_one(company)

def update_company(domain: str, updates: dict):
    """Update company by domain"""
    updates["updated_at"] = datetime.utcnow().isoformat()
    return companies_collection.update_one(
        {"domain": domain.lower()},
        {"$set": updates}
    )

def delete_company(domain: str):
    """Delete company by domain"""
    return companies_collection.delete_one({"domain": domain.lower()})

# Initial companies data
INITIAL_COMPANIES = [
    {"name": "Airbnb", "domain": "airbnb.com", "keywords": ["travel", "hospitality"]},
    {"name": "Shopify", "domain": "shopify.com", "keywords": ["ecommerce", "retail"]},
    {"name": "Stripe", "domain": "stripe.com", "keywords": ["fintech", "payments"]},
    {"name": "Uber", "domain": "uber.com", "keywords": ["transportation", "ride-sharing"]},
    {"name": "Notion", "domain": "notion.so", "keywords": ["productivity", "saas"]},
    {"name": "Slack", "domain": "slack.com", "keywords": ["communication", "saas"]},
    {"name": "Dropbox", "domain": "dropbox.com", "keywords": ["cloud", "storage"]},
    {"name": "Spotify", "domain": "spotify.com", "keywords": ["music", "streaming"]},
    {"name": "Netflix", "domain": "netflix.com", "keywords": ["entertainment", "streaming"]},
    {"name": "PayPal", "domain": "paypal.com", "keywords": ["fintech", "payments"]},
    {"name": "Square", "domain": "square.com", "keywords": ["fintech", "payments"]},
    {"name": "Zoom", "domain": "zoom.com", "keywords": ["communication", "saas"]},
    {"name": "Salesforce", "domain": "salesforce.com", "keywords": ["crm", "saas"]},
    {"name": "HubSpot", "domain": "hubspot.com", "keywords": ["marketing", "saas"]},
    {"name": "Atlassian", "domain": "atlassian.com", "keywords": ["software", "saas"]},
    {"name": "Twilio", "domain": "twilio.com", "keywords": ["communication", "api"]},
    {"name": "MongoDB", "domain": "mongodb.com", "keywords": ["database", "saas"]},
    {"name": "Datadog", "domain": "datadog.com", "keywords": ["monitoring", "saas"]},
    {"name": "Cloudflare", "domain": "cloudflare.com", "keywords": ["cloud", "security"]},
    {"name": "Canva", "domain": "canva.com", "keywords": ["design", "saas"]}
]

def init_companies():
    """Initialize companies if they don't exist"""
    for company in INITIAL_COMPANIES:
        existing = get_company_by_domain(company["domain"])
        if not existing:
            create_company(company["name"], company["domain"], company["keywords"])
            print(f"✅ Added company: {company['name']}")
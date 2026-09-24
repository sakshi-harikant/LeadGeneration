from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
from app.routes import leads, export, auth, companies
from app.database.mongodb import test_connection, create_indexes, init_companies

load_dotenv()

app = FastAPI(
    title="Lead Generation System API",
    description="API for discovering and managing business leads",
    version="2.0.0"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://leadgen-frontend-six.vercel.app",
        "https://leadgen-frontend-bfinuutjj-sakshi-mohan-harikant-s-projects.vercel.app",
    ],
    allow_origins_regex="https://.*\\.vercel\\.app",  # ← NEW LINE
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth.router)
app.include_router(companies.router)
app.include_router(leads.router)
app.include_router(export.router)

@app.get("/")
async def root():
    return {
        "message": "Lead Generation System API is running!",
        "status": "online",
        "version": "2.0.0"
    }

@app.get("/api/health")
async def health_check():
    db_connected = test_connection()
    hunter_key = os.getenv("HUNTER_API_KEY", "not_set")
    
    return {
        "status": "healthy",
        "database": "connected" if db_connected else "not_connected",
        "hunter_api": "configured" if hunter_key != "not_set" else "not_configured",
        "version": "2.0.0"
    }

@app.on_event("startup")
async def startup_event():
    print("\n" + "="*60)
    print("🚀 STARTING LEAD GENERATION SYSTEM v2.0")
    print("="*60)
    print("🔗 Testing database connection...")
    test_connection()
    print("📊 Creating indexes...")
    create_indexes()
    print("🏢 Initializing companies...")
    init_companies()
    print("✅ Application ready!")
    print("="*60 + "\n")
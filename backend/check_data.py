import asyncio
from app.database.mongodb import leads_collection
from app.services.hunter_service import hunter_service

def check_database():
    """Check what's in MongoDB"""
    print("\n" + "="*60)
    print("📊 CHECKING MONGODB DATABASE")
    print("="*60)
    
    all_leads = list(leads_collection.find())
    
    print(f"\n📌 Total leads in database: {len(all_leads)}")
    
    if len(all_leads) == 0:
        print("❌ No leads found in database!")
        return
    
    print("\n" + "-"*60)
    print("📋 First 5 leads:")
    print("-"*60)
    
    for i, lead in enumerate(all_leads[:5]):
        print(f"\n📌 Lead {i+1}:")
        print(f"  Name:           {lead.get('name', 'N/A')}")
        print(f"  First Name:     {lead.get('firstName', 'N/A')}")
        print(f"  Last Name:      {lead.get('lastName', 'N/A')}")
        print(f"  Job Title:      {lead.get('jobTitle', 'N/A')}")
        print(f"  Company:        {lead.get('company', 'N/A')}")
        print(f"  Company Domain: {lead.get('companyDomain', 'N/A')}")
        print(f"  Email:          {lead.get('email', 'N/A')}")
        print(f"  Email Status:   {lead.get('emailStatus', 'N/A')}")
        print(f"  Phone:          {lead.get('phone', 'N/A')}")
        print(f"  LinkedIn:       {lead.get('linkedinUrl', 'N/A')}")

async def check_hunter():
    """Check what Hunter returns"""
    print("\n" + "="*60)
    print("🔍 CHECKING HUNTER API RESPONSE")
    print("="*60)
    
    domain = input("\nEnter domain to test (e.g., stripe.com): ") or "stripe.com"
    
    try:
        response = await hunter_service.domain_search(domain)
        
        if "data" in response and "emails" in response["data"]:
            emails = response["data"]["emails"]
            print(f"\n✅ Found {len(emails)} emails for {domain}")
            
            if len(emails) > 0:
                print("\n" + "-"*60)
                print("📧 First email data from Hunter:")
                print("-"*60)
                
                first = emails[0]
                print(f"\n  All fields: {list(first.keys())}")
                print(f"\n  Full data:")
                for key, value in first.items():
                    print(f"    {key}: {value}")
        else:
            print(f"\n❌ No emails found for {domain}")
            print(f"Response: {response}")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")

def main():
    print("\n" + "="*60)
    print("🔎 LEAD GENERATION SYSTEM - DATA CHECKER")
    print("="*60)
    
    while True:
        print("\n" + "-"*60)
        print("Choose an option:")
        print("1. Check MongoDB database")
        print("2. Check Hunter API response")
        print("3. Check both")
        print("4. Exit")
        print("-"*60)
        
        choice = input("\nEnter your choice (1-4): ").strip()
        
        if choice == "1":
            check_database()
        elif choice == "2":
            asyncio.run(check_hunter())
        elif choice == "3":
            check_database()
            asyncio.run(check_hunter())
        elif choice == "4":
            print("👋 Goodbye!")
            break
        else:
            print("❌ Invalid choice. Please enter 1, 2, 3, or 4.")
        
        input("\nPress Enter to continue...")

if __name__ == "__main__":
    main()
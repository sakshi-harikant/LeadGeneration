from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
import io
import csv
import pandas as pd
from app.services.lead_service import lead_service

router = APIRouter(prefix="/api/leads/export", tags=["export"])

@router.get("/csv")
async def export_csv():
    """Export all leads as CSV file"""
    try:
        # Get all leads
        leads = await lead_service.get_all_leads(0, 10000)
        
        if not leads:
            raise HTTPException(status_code=404, detail="No leads found to export")
        
        # Create CSV in memory
        output = io.StringIO()
        writer = csv.writer(output)
        
        # Write headers
        headers = [
            "Name", "First Name", "Last Name", "Job Title", 
            "Company", "Company Domain", "Email", "Email Status", 
            "Email Confidence", "Phone", "LinkedIn URL", "Website", 
            "Location", "Source"
        ]
        writer.writerow(headers)
        
        # Write data
        for lead in leads:
            writer.writerow([
                lead.get("name", ""),
                lead.get("firstName", ""),
                lead.get("lastName", ""),
                lead.get("jobTitle", ""),
                lead.get("company", ""),
                lead.get("companyDomain", ""),
                lead.get("email", ""),
                lead.get("emailStatus", ""),
                lead.get("emailConfidence", ""),
                lead.get("phone", ""),
                lead.get("linkedinUrl", ""),
                lead.get("website", ""),
                lead.get("location", ""),
                lead.get("source", "Hunter")
            ])
        
        # Return as downloadable file
        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=leads_export.csv"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/excel")
async def export_excel():
    """Export all leads as Excel file"""
    try:
        # Get all leads
        leads = await lead_service.get_all_leads(0, 10000)
        
        if not leads:
            raise HTTPException(status_code=404, detail="No leads found to export")
        
        # Convert to DataFrame
        df = pd.DataFrame(leads)
        
        # Select and rename columns for export
        export_columns = [
            "name", "firstName", "lastName", "jobTitle", 
            "company", "companyDomain", "email", "emailStatus", 
            "emailConfidence", "phone", "linkedinUrl", "website", 
            "location", "source"
        ]
        
        # Only include columns that exist
        existing_columns = [col for col in export_columns if col in df.columns]
        df_export = df[existing_columns].copy()
        
        # Rename columns for readability
        column_mapping = {
            "name": "Name",
            "firstName": "First Name",
            "lastName": "Last Name",
            "jobTitle": "Job Title",
            "company": "Company",
            "companyDomain": "Company Domain",
            "email": "Email",
            "emailStatus": "Email Status",
            "emailConfidence": "Email Confidence",
            "phone": "Phone",
            "linkedinUrl": "LinkedIn URL",
            "website": "Website",
            "location": "Location",
            "source": "Source"
        }
        df_export = df_export.rename(columns=column_mapping)
        
        # Create Excel file in memory
        output = io.BytesIO()
        with pd.ExcelWriter(output, engine='openpyxl') as writer:
            df_export.to_excel(writer, index=False, sheet_name="Leads")
        
        output.seek(0)
        
        return StreamingResponse(
            output,
            media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            headers={"Content-Disposition": "attachment; filename=leads_export.xlsx"}
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
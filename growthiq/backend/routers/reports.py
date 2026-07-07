from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import StreamingResponse
from db.supabase import get_supabase
from middleware.auth import get_current_user
from services.pdf_service import generate_business_report

router = APIRouter()


@router.post("/pdf")
def download_pdf(current_user: dict = Depends(get_current_user), db=Depends(get_supabase)):
    biz = db.table("business_data").select("*").eq("user_id", current_user["id"]).execute()
    if not biz.data:
        raise HTTPException(status_code=404, detail="No business data found")

    analysis = db.table("analyses").select("*").eq("user_id", current_user["id"]).order("created_at", desc=True).limit(1).execute()
    if not analysis.data:
        raise HTTPException(status_code=404, detail="No analysis found. Run an analysis first.")

    pdf_buffer = generate_business_report(biz.data[0], analysis.data[0])
    business_name = biz.data[0].get("business_name", "business").replace(" ", "_")
    filename = f"GrowthIQ_Report_{business_name}.pdf"

    return StreamingResponse(
        pdf_buffer,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )

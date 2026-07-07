from fastapi import APIRouter, HTTPException, Depends
from db.supabase import get_supabase
from schemas.models import AnalysisOut
from middleware.auth import get_current_user
from services import gemini_service
from datetime import datetime
import uuid

router = APIRouter()


def calculate_health_score(breakdown: dict) -> int:
    return min(100, int(sum(breakdown.values())))


@router.post("/run", response_model=AnalysisOut)
def run_analysis(current_user: dict = Depends(get_current_user), db=Depends(get_supabase)):
    biz = db.table("business_data").select("*").eq("user_id", current_user["id"]).execute()
    if not biz.data:
        raise HTTPException(status_code=400, detail="Submit your business data first before running analysis")

    metrics = biz.data[0]

    try:
        ai_result = gemini_service.run_analysis(metrics)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI analysis failed: {str(e)}")

    score_breakdown = ai_result.get("score_breakdown", {"profitability": 0, "growth": 0, "customers": 0, "digital": 0})
    health_score = calculate_health_score(score_breakdown)

    try:
        marketing_plan = gemini_service.generate_marketing_plan(metrics)
        content_calendar = gemini_service.generate_content_calendar(metrics.get("industry"), metrics.get("business_name"))
        seo_tips = gemini_service.generate_seo_audit(metrics.get("business_name"), metrics.get("industry"), metrics.get("city", ""))
    except:
        marketing_plan, content_calendar, seo_tips = [], [], []

    analysis_id = str(uuid.uuid4())
    result = db.table("analyses").insert({
        "id": analysis_id,
        "user_id": current_user["id"],
        "health_score": health_score,
        "score_breakdown": score_breakdown,
        "recommendations": ai_result.get("recommendations", []),
        "swot": ai_result.get("swot", {}),
        "marketing_plan": marketing_plan,
        "seo_tips": seo_tips,
        "competitor_insights": ai_result.get("competitor_insights", {}),
        "budget_allocation": ai_result.get("budget_allocation", {}),
        "content_calendar": content_calendar,
        "summary": ai_result.get("summary", ""),
    }).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save analysis")

    # Save monthly growth score
    month_str = datetime.now().strftime("%B %Y")
    db.table("growth_scores").insert({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "month": month_str,
        "score": health_score,
        "delta": 0,
        "badges": []
    }).execute()

    return AnalysisOut(**result.data[0])


@router.get("/latest", response_model=AnalysisOut)
def get_latest(current_user: dict = Depends(get_current_user), db=Depends(get_supabase)):
    result = db.table("analyses").select("*").eq("user_id", current_user["id"]).order("created_at", desc=True).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="No analysis found. Run your first analysis to get started.")
    return AnalysisOut(**result.data[0])


@router.get("/history")
def get_history(current_user: dict = Depends(get_current_user), db=Depends(get_supabase)):
    result = db.table("analyses").select("id,health_score,summary,created_at").eq("user_id", current_user["id"]).order("created_at", desc=True).execute()
    return result.data

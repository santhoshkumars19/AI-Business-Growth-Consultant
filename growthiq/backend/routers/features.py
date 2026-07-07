from fastapi import APIRouter, HTTPException, Depends
from db.supabase import get_supabase
from middleware.auth import get_current_user

router = APIRouter()


def get_latest_analysis(user_id: str, db):
    result = db.table("analyses").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Run an AI analysis first to unlock this feature.")
    return result.data[0]


@router.get("/swot")
def get_swot(current_user: dict = Depends(get_current_user), db=Depends(get_supabase)):
    analysis = get_latest_analysis(current_user["id"], db)
    return {"swot": analysis.get("swot", {}), "health_score": analysis["health_score"]}


@router.get("/marketing-plan")
def get_marketing_plan(current_user: dict = Depends(get_current_user), db=Depends(get_supabase)):
    analysis = get_latest_analysis(current_user["id"], db)
    return {"marketing_plan": analysis.get("marketing_plan", []), "health_score": analysis["health_score"]}


@router.get("/seo-audit")
def get_seo_audit(current_user: dict = Depends(get_current_user), db=Depends(get_supabase)):
    analysis = get_latest_analysis(current_user["id"], db)
    return {"seo_tips": analysis.get("seo_tips", [])}


@router.get("/competitor")
def get_competitor(current_user: dict = Depends(get_current_user), db=Depends(get_supabase)):
    analysis = get_latest_analysis(current_user["id"], db)
    return {"competitor_insights": analysis.get("competitor_insights", {})}


@router.get("/content-calendar")
def get_content_calendar(current_user: dict = Depends(get_current_user), db=Depends(get_supabase)):
    analysis = get_latest_analysis(current_user["id"], db)
    return {"content_calendar": analysis.get("content_calendar", [])}


@router.get("/budget")
def get_budget(current_user: dict = Depends(get_current_user), db=Depends(get_supabase)):
    analysis = get_latest_analysis(current_user["id"], db)
    return {"budget_allocation": analysis.get("budget_allocation", {})}


@router.get("/growth-score")
def get_growth_score(current_user: dict = Depends(get_current_user), db=Depends(get_supabase)):
    result = db.table("growth_scores").select("*").eq("user_id", current_user["id"]).order("created_at", desc=True).execute()
    return {"scores": result.data}

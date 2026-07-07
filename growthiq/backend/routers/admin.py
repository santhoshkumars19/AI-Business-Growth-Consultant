from fastapi import APIRouter, HTTPException, Depends
from db.supabase import get_supabase
from middleware.auth import require_admin

router = APIRouter()


@router.get("/users")
def get_all_users(admin=Depends(require_admin), db=Depends(get_supabase)):
    result = db.table("users").select("id,name,email,plan,role,is_active,created_at").order("created_at", desc=True).execute()
    return result.data


@router.get("/analytics")
def get_analytics(admin=Depends(require_admin), db=Depends(get_supabase)):
    users = db.table("users").select("id,plan,created_at").execute()
    analyses = db.table("analyses").select("id,health_score,created_at").execute()
    payments = db.table("payments").select("amount,status,created_at").eq("status", "success").execute()

    total_users = len(users.data)
    total_analyses = len(analyses.data)
    avg_health = round(sum(a["health_score"] for a in analyses.data) / total_analyses, 1) if total_analyses else 0
    total_revenue = sum(p["amount"] for p in payments.data) / 100

    plan_dist = {"starter": 0, "growth": 0, "scale": 0}
    for u in users.data:
        plan = u.get("plan", "starter")
        plan_dist[plan] = plan_dist.get(plan, 0) + 1

    return {
        "total_users": total_users,
        "total_analyses": total_analyses,
        "avg_health_score": avg_health,
        "total_revenue_inr": total_revenue,
        "plan_distribution": plan_dist,
    }


@router.get("/revenue")
def get_revenue(admin=Depends(require_admin), db=Depends(get_supabase)):
    result = db.table("payments").select("*").order("created_at", desc=True).execute()
    return result.data


@router.get("/feedback")
def get_feedback(admin=Depends(require_admin), db=Depends(get_supabase)):
    result = db.table("feedback").select("*").order("created_at", desc=True).execute()
    return result.data


@router.patch("/feedback/{feedback_id}")
def update_feedback(feedback_id: str, status: str, admin=Depends(require_admin), db=Depends(get_supabase)):
    result = db.table("feedback").update({"status": status}).eq("id", feedback_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Feedback not found")
    return result.data[0]


@router.get("/ai-usage")
def get_ai_usage(admin=Depends(require_admin), db=Depends(get_supabase)):
    result = db.table("analyses").select("id,user_id,health_score,created_at").order("created_at", desc=True).execute()
    return {"total_analyses": len(result.data), "analyses": result.data}

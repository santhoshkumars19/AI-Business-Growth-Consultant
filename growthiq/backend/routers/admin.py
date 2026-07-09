from fastapi import APIRouter, HTTPException, Depends, Query
from db.supabase import get_supabase
from middleware.auth import require_admin, hash_password
from typing import Optional
import uuid

router = APIRouter()


# ── Users ─────────────────────────────────────────────────────────────────────

@router.get("/users")
def get_all_users(
    search: Optional[str] = Query(None),
    role: Optional[str] = Query(None),
    plan: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    admin=Depends(require_admin),
    db=Depends(get_supabase)
):
    users_result = db.table("users").select(
        "id,name,email,plan,role,is_active,created_at"
    ).order("created_at", desc=True).execute()

    users = users_result.data or []

    # Try to fetch business data and join
    biz_result = db.table("businesses").select("user_id,business_name,industry,city,state").execute()
    biz_map = {b["user_id"]: b for b in (biz_result.data or [])}

    enriched = []
    for u in users:
        b = biz_map.get(u["id"], {})
        enriched.append({
            **u,
            "business_name": b.get("business_name", "—"),
            "industry": b.get("industry", "—"),
            "city": b.get("city", "—"),
            "state": b.get("state", "—"),
        })

    # Filters
    if search:
        q = search.lower()
        enriched = [u for u in enriched if q in u["name"].lower() or q in u["email"].lower()]
    if role and role != "all":
        enriched = [u for u in enriched if u.get("role") == role]
    if plan and plan != "all":
        enriched = [u for u in enriched if u.get("plan") == plan]

    total = len(enriched)
    start = (page - 1) * per_page
    paginated = enriched[start: start + per_page]

    return {"total": total, "page": page, "per_page": per_page, "users": paginated}


@router.get("/users/{user_id}")
def get_user_detail(user_id: str, admin=Depends(require_admin), db=Depends(get_supabase)):
    user_r = db.table("users").select("*").eq("id", user_id).execute()
    if not user_r.data:
        raise HTTPException(status_code=404, detail="User not found")
    user = user_r.data[0]

    biz_r = db.table("businesses").select("*").eq("user_id", user_id).execute()
    business = biz_r.data[0] if biz_r.data else {}

    analyses_r = db.table("analyses").select(
        "id,health_score,score_breakdown,swot,created_at"
    ).eq("user_id", user_id).order("created_at", desc=True).execute()
    analyses = analyses_r.data or []

    return {
        "user": user,
        "business": business,
        "analyses": analyses,
        "total_reports": len(analyses),
        "latest_score": analyses[0]["health_score"] if analyses else None,
    }


@router.patch("/users/{user_id}")
def update_user(
    user_id: str,
    payload: dict,
    admin=Depends(require_admin),
    db=Depends(get_supabase)
):
    allowed = {"plan", "role", "is_active", "name"}
    update_data = {k: v for k, v in payload.items() if k in allowed}
    if not update_data:
        raise HTTPException(status_code=400, detail="No valid fields to update")
    result = db.table("users").update(update_data).eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return result.data[0]


@router.delete("/users/{user_id}")
def delete_user(user_id: str, admin=Depends(require_admin), db=Depends(get_supabase)):
    # Delete related data first
    db.table("analyses").delete().eq("user_id", user_id).execute()
    db.table("businesses").delete().eq("user_id", user_id).execute()
    db.table("payments").delete().eq("user_id", user_id).execute()
    result = db.table("users").delete().eq("id", user_id).execute()
    return {"deleted": True, "user_id": user_id}


@router.post("/users/{user_id}/reset-password")
def reset_password(user_id: str, payload: dict, admin=Depends(require_admin), db=Depends(get_supabase)):
    new_password = payload.get("new_password", "")
    if len(new_password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    hashed = hash_password(new_password)
    result = db.table("users").update({"hashed_password": hashed}).eq("id", user_id).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return {"success": True}


# ── Analytics ─────────────────────────────────────────────────────────────────

@router.get("/analytics")
def get_analytics(admin=Depends(require_admin), db=Depends(get_supabase)):
    users = db.table("users").select("id,plan,role,created_at").execute()
    analyses = db.table("analyses").select("id,health_score,user_id,created_at").execute()
    payments = db.table("payments").select("amount,status,created_at").eq("status", "success").execute()
    businesses = db.table("businesses").select("industry,state").execute()

    users_data = users.data or []
    analyses_data = analyses.data or []
    payments_data = payments.data or []
    biz_data = businesses.data or []

    total_users = len(users_data)
    total_analyses = len(analyses_data)
    avg_health = round(sum(a["health_score"] for a in analyses_data) / total_analyses, 1) if total_analyses else 0
    total_revenue = sum(p["amount"] for p in payments_data) / 100

    plan_dist = {"starter": 0, "growth": 0, "scale": 0}
    for u in users_data:
        plan = u.get("plan", "starter")
        plan_dist[plan] = plan_dist.get(plan, 0) + 1

    industry_dist: dict = {}
    for b in biz_data:
        ind = b.get("industry", "Other")
        industry_dist[ind] = industry_dist.get(ind, 0) + 1

    # Monthly registrations (last 12 months)
    from collections import defaultdict
    monthly_reg: dict = defaultdict(int)
    for u in users_data:
        if u.get("created_at"):
            month = u["created_at"][:7]  # YYYY-MM
            monthly_reg[month] += 1

    return {
        "total_users": total_users,
        "total_analyses": total_analyses,
        "avg_health_score": avg_health,
        "total_revenue_inr": total_revenue,
        "plan_distribution": plan_dist,
        "industry_distribution": dict(sorted(industry_dist.items(), key=lambda x: -x[1])[:10]),
        "monthly_registrations": dict(sorted(monthly_reg.items())),
        "active_users": len([u for u in users_data if u.get("role") != "admin"]),
    }


# ── Reports ───────────────────────────────────────────────────────────────────

@router.get("/reports")
def get_all_reports(
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    admin=Depends(require_admin),
    db=Depends(get_supabase)
):
    analyses_r = db.table("analyses").select(
        "id,user_id,health_score,summary,created_at"
    ).order("created_at", desc=True).execute()

    users_r = db.table("users").select("id,name,email").execute()
    user_map = {u["id"]: u for u in (users_r.data or [])}

    reports = []
    for a in (analyses_r.data or []):
        u = user_map.get(a["user_id"], {})
        reports.append({
            **a,
            "user_name": u.get("name", "Unknown"),
            "user_email": u.get("email", ""),
        })

    if search:
        q = search.lower()
        reports = [r for r in reports if q in r["user_name"].lower() or q in r["user_email"].lower()]

    total = len(reports)
    start = (page - 1) * per_page
    return {"total": total, "page": page, "per_page": per_page, "reports": reports[start: start + per_page]}


@router.delete("/reports/{report_id}")
def delete_report(report_id: str, admin=Depends(require_admin), db=Depends(get_supabase)):
    db.table("analyses").delete().eq("id", report_id).execute()
    return {"deleted": True, "report_id": report_id}


# ── Revenue ───────────────────────────────────────────────────────────────────

@router.get("/revenue")
def get_revenue(admin=Depends(require_admin), db=Depends(get_supabase)):
    result = db.table("payments").select("*").order("created_at", desc=True).execute()
    payments = result.data or []

    from collections import defaultdict
    monthly_revenue: dict = defaultdict(float)
    for p in payments:
        if p.get("status") == "success" and p.get("created_at"):
            month = p["created_at"][:7]
            monthly_revenue[month] += p.get("amount", 0) / 100

    total_revenue = sum(p.get("amount", 0) for p in payments if p.get("status") == "success") / 100
    mrr = monthly_revenue.get(sorted(monthly_revenue.keys())[-1], 0) if monthly_revenue else 0

    return {
        "payments": payments,
        "total_revenue_inr": total_revenue,
        "mrr": mrr,
        "monthly_revenue": dict(sorted(monthly_revenue.items())),
    }


# ── Feedback ──────────────────────────────────────────────────────────────────

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


# ── AI Usage ──────────────────────────────────────────────────────────────────

@router.get("/ai-usage")
def get_ai_usage(admin=Depends(require_admin), db=Depends(get_supabase)):
    result = db.table("analyses").select("id,user_id,health_score,created_at").order("created_at", desc=True).execute()
    return {"total_analyses": len(result.data or []), "analyses": result.data}


# ── Notifications ─────────────────────────────────────────────────────────────

@router.get("/notifications")
def get_notifications(admin=Depends(require_admin), db=Depends(get_supabase)):
    recent_users = db.table("users").select(
        "id,name,email,plan,created_at"
    ).order("created_at", desc=True).limit(20).execute()

    notifications = []
    for u in (recent_users.data or []):
        notifications.append({
            "type": "registration",
            "title": f"New user registered: {u['name']}",
            "subtitle": u["email"],
            "meta": u.get("plan", "starter"),
            "created_at": u.get("created_at"),
        })

    return {"notifications": notifications}


# ── Overview ──────────────────────────────────────────────────────────────────

@router.get("/overview")
def get_overview(admin=Depends(require_admin), db=Depends(get_supabase)):
    users = db.table("users").select("id,plan,role,created_at").execute()
    analyses = db.table("analyses").select("id,health_score,created_at").execute()
    payments = db.table("payments").select("amount,status").eq("status", "success").execute()
    businesses = db.table("businesses").select("id").execute()

    users_data = users.data or []
    analyses_data = analyses.data or []
    payments_data = payments.data or []

    return {
        "total_users": len([u for u in users_data if u.get("role") != "admin"]),
        "total_businesses": len(businesses.data or []),
        "total_reports": len(analyses_data),
        "total_revenue_inr": sum(p.get("amount", 0) for p in payments_data) / 100,
        "avg_health_score": round(sum(a["health_score"] for a in analyses_data) / len(analyses_data), 1) if analyses_data else 0,
    }


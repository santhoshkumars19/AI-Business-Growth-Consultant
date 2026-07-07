from fastapi import APIRouter, HTTPException, Depends
from db.supabase import get_supabase
from schemas.models import BusinessDataIn, BusinessDataOut
from middleware.auth import get_current_user
import uuid

router = APIRouter()


@router.post("", response_model=BusinessDataOut)
def save_business(data: BusinessDataIn, current_user: dict = Depends(get_current_user), db=Depends(get_supabase)):
    existing = db.table("business_data").select("id").eq("user_id", current_user["id"]).execute()
    payload = {**data.model_dump(), "user_id": current_user["id"]}

    if existing.data:
        result = db.table("business_data").update(payload).eq("user_id", current_user["id"]).execute()
    else:
        payload["id"] = str(uuid.uuid4())
        result = db.table("business_data").insert(payload).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save business data")
    return BusinessDataOut(**result.data[0])


@router.get("", response_model=BusinessDataOut)
def get_business(current_user: dict = Depends(get_current_user), db=Depends(get_supabase)):
    result = db.table("business_data").select("*").eq("user_id", current_user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="No business data found. Please submit your business details first.")
    return BusinessDataOut(**result.data[0])


@router.put("", response_model=BusinessDataOut)
def update_business(data: BusinessDataIn, current_user: dict = Depends(get_current_user), db=Depends(get_supabase)):
    result = db.table("business_data").update(data.model_dump()).eq("user_id", current_user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Business data not found")
    return BusinessDataOut(**result.data[0])

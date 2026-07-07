from fastapi import APIRouter, HTTPException, Depends
from db.supabase import get_supabase
from schemas.models import PaymentOrderIn, PaymentVerifyIn
from middleware.auth import get_current_user
from services import razorpay_service
import uuid

router = APIRouter()


@router.post("/create-order")
def create_order(data: PaymentOrderIn, current_user: dict = Depends(get_current_user), db=Depends(get_supabase)):
    try:
        order = razorpay_service.create_order(data.plan, data.addons)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Payment order failed: {str(e)}")

    db.table("payments").insert({
        "id": str(uuid.uuid4()),
        "user_id": current_user["id"],
        "razorpay_order_id": order["order_id"],
        "amount": order["amount"],
        "plan": data.plan,
        "addons": data.addons,
        "status": "pending"
    }).execute()

    return order


@router.post("/verify")
def verify_payment(data: PaymentVerifyIn, current_user: dict = Depends(get_current_user), db=Depends(get_supabase)):
    is_valid = razorpay_service.verify_payment(
        data.razorpay_order_id, data.razorpay_payment_id, data.razorpay_signature
    )
    if not is_valid:
        raise HTTPException(status_code=400, detail="Invalid payment signature. Contact support.")

    db.table("payments").update({
        "razorpay_payment_id": data.razorpay_payment_id,
        "status": "success"
    }).eq("razorpay_order_id", data.razorpay_order_id).execute()

    payment = db.table("payments").select("plan").eq("razorpay_order_id", data.razorpay_order_id).execute()
    if payment.data:
        db.table("users").update({"plan": payment.data[0]["plan"]}).eq("id", current_user["id"]).execute()

    return {"status": "success", "message": "Payment verified. Your plan is now active!"}


@router.get("/history")
def payment_history(current_user: dict = Depends(get_current_user), db=Depends(get_supabase)):
    result = db.table("payments").select("*").eq("user_id", current_user["id"]).order("created_at", desc=True).execute()
    return result.data

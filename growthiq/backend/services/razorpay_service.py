from dotenv import load_dotenv
import os
import hmac
import hashlib

load_dotenv()

_client = None

def _get_client():
    global _client
    if _client is None:
        import razorpay
        _client = razorpay.Client(
            auth=(os.getenv("RAZORPAY_KEY_ID"), os.getenv("RAZORPAY_KEY_SECRET"))
        )
    return _client


PLAN_PRICES = {
    "starter": 99900,   # ₹999 in paise
    "growth":  249900,  # ₹2,499 in paise
    "scale":   599900,  # ₹5,999 in paise
}

ADDON_PRICES = {
    "extra-analysis":   49900,
    "competitor-deep":  79900,
    "seo-pro":          99900,
    "whatsapp-reports": 29900,
    "multi-branch":    149900,
    "custom-pdf":       39900,
    "financial-model": 129900,
    "dedicated-manager": 299900,
}


def create_order(plan: str, addons: list = []) -> dict:
    """Create a Razorpay order for a plan + optional add-ons."""
    amount = PLAN_PRICES.get(plan, 0)
    for addon in addons:
        amount += ADDON_PRICES.get(addon, 0)

    order = _get_client().order.create({
        "amount": amount,
        "currency": "INR",
        "payment_capture": 1,
        "notes": {
            "plan": plan,
            "addons": ",".join(addons)
        }
    })
    return {
        "order_id": order["id"],
        "amount": amount,
        "currency": "INR",
        "key_id": os.getenv("RAZORPAY_KEY_ID"),
    }


def verify_payment(order_id: str, payment_id: str, signature: str) -> bool:
    """Verify Razorpay payment signature using HMAC SHA256."""
    secret = os.getenv("RAZORPAY_KEY_SECRET", "")
    message = f"{order_id}|{payment_id}"
    expected = hmac.new(
        secret.encode("utf-8"),
        message.encode("utf-8"),
        hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)

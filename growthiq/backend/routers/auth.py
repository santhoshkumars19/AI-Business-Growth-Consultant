"""
Authentication router for GrowthIQ AI.
Includes: register, login, me, forgot-password, reset-password
"""

import os
import secrets
import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import JSONResponse

from db.supabase import get_supabase
from schemas.models import (
    UserRegister, UserLogin, TokenOut, UserOut,
    ForgotPasswordIn, ForgotPasswordOut,
    ResetPasswordIn, ResetPasswordOut,
)
from middleware.auth import (
    hash_password, verify_password, create_access_token, get_current_user
)
from services.email_service import send_password_reset_email
import uuid

logger = logging.getLogger(__name__)
router = APIRouter()

# ── Hardcoded Admin Credentials ───────────────────────────────────────────────
ADMIN_EMAIL    = "admin@growthiq.com"
ADMIN_PASSWORD = "Admin@123"
ADMIN_NAME     = "GrowthIQ Admin"

# Reset token lifetime
RESET_TOKEN_EXPIRY_MINUTES = 15


# ── Helpers ───────────────────────────────────────────────────────────────────

def _ensure_admin_exists(db) -> dict:
    """Upsert the hardcoded admin user into the DB if not already present."""
    existing = db.table("users").select("*").eq("email", ADMIN_EMAIL).execute()
    if existing.data:
        user = existing.data[0]
        if user.get("role") != "admin":
            db.table("users").update({"role": "admin"}).eq("id", user["id"]).execute()
            user["role"] = "admin"
        return user
    admin_id = str(uuid.uuid4())
    hashed = hash_password(ADMIN_PASSWORD)
    result = db.table("users").insert({
        "id": admin_id,
        "name": ADMIN_NAME,
        "email": ADMIN_EMAIL,
        "hashed_password": hashed,
        "plan": "scale",
        "role": "admin",
    }).execute()
    return result.data[0] if result.data else {
        "id": admin_id, "name": ADMIN_NAME, "email": ADMIN_EMAIL,
        "plan": "scale", "role": "admin",
    }


def _validate_password_strength(password: str) -> str | None:
    """
    Returns an error message string if password is invalid, else None.
    Rules: min 8 chars, 1 uppercase, 1 lowercase, 1 digit, 1 special char.
    """
    import re
    if len(password) < 8:
        return "Password must be at least 8 characters."
    if not re.search(r"[A-Z]", password):
        return "Password must contain at least one uppercase letter."
    if not re.search(r"[a-z]", password):
        return "Password must contain at least one lowercase letter."
    if not re.search(r"\d", password):
        return "Password must contain at least one number."
    if not re.search(r"[^A-Za-z0-9]", password):
        return "Password must contain at least one special character."
    return None


# ── Routes ────────────────────────────────────────────────────────────────────

@router.post("/register", response_model=TokenOut)
def register(data: UserRegister, db=Depends(get_supabase)):
    if data.email.lower() == ADMIN_EMAIL.lower():
        raise HTTPException(status_code=400, detail="This email is reserved.")
    existing = db.table("users").select("id").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")

    pwd_err = _validate_password_strength(data.password)
    if pwd_err:
        raise HTTPException(status_code=422, detail=pwd_err)

    user_id = str(uuid.uuid4())
    hashed  = hash_password(data.password)
    result  = db.table("users").insert({
        "id": user_id,
        "name": data.name,
        "email": data.email,
        "hashed_password": hashed,
        "plan": "starter",
        "role": "user",
    }).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create user")
    user  = result.data[0]
    token = create_access_token({
        "sub": user["id"], "email": user["email"],
        "role": user["role"], "plan": user["plan"],
    })
    return {"access_token": token, "token_type": "bearer", "user": UserOut(**user)}


@router.post("/login", response_model=TokenOut)
def login(data: UserLogin, db=Depends(get_supabase)):
    # ── Admin shortcut ────────────────────────────────────────────────────────
    if data.email.lower() == ADMIN_EMAIL.lower():
        if data.password != ADMIN_PASSWORD:
            raise HTTPException(status_code=401, detail="Invalid admin credentials")
        user  = _ensure_admin_exists(db)
        token = create_access_token({
            "sub": user["id"], "email": user["email"],
            "role": "admin", "plan": user.get("plan", "scale"),
        })
        return {"access_token": token, "token_type": "bearer", "user": UserOut(**user)}

    # ── Normal user login ─────────────────────────────────────────────────────
    result = db.table("users").select("*").eq("email", data.email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user = result.data[0]
    if not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({
        "sub": user["id"], "email": user["email"],
        "role": user["role"], "plan": user["plan"],
    })
    return {"access_token": token, "token_type": "bearer", "user": UserOut(**user)}


@router.get("/me", response_model=UserOut)
def get_me(current_user: dict = Depends(get_current_user), db=Depends(get_supabase)):
    result = db.table("users").select("*").eq("id", current_user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(**result.data[0])


# ── Forgot Password ───────────────────────────────────────────────────────────

@router.post("/forgot-password", response_model=ForgotPasswordOut)
def forgot_password(data: ForgotPasswordIn, db=Depends(get_supabase)):
    """
    Initiate password reset.
    Always returns a generic success message to prevent email enumeration.
    """
    GENERIC_RESPONSE = {
        "message": (
            "If an account with that email exists, you will receive a "
            "password reset link within a few minutes."
        )
    }

    # Look up the user (silently skip if not found)
    result = db.table("users").select("id, name, email").eq("email", data.email).execute()
    if not result.data:
        logger.info("[FORGOT-PW] Email not found (not disclosed): %s", data.email)
        return GENERIC_RESPONSE

    user = result.data[0]

    # Block admin account from self-service reset
    if user["email"].lower() == ADMIN_EMAIL.lower():
        return GENERIC_RESPONSE

    # Generate a cryptographically secure token
    raw_token    = secrets.token_urlsafe(48)          # 64 chars URL-safe
    token_expiry = datetime.now(timezone.utc) + timedelta(minutes=RESET_TOKEN_EXPIRY_MINUTES)

    # Invalidate any existing reset tokens for this user
    try:
        db.table("password_resets").delete().eq("user_id", user["id"]).execute()
    except Exception:
        pass  # table might not exist yet — handled below

    # Store the token
    try:
        db.table("password_resets").insert({
            "id":         str(uuid.uuid4()),
            "user_id":    user["id"],
            "token":      raw_token,
            "expires_at": token_expiry.isoformat(),
            "used":       False,
        }).execute()
    except Exception as exc:
        logger.error("[FORGOT-PW] Could not save reset token: %s", exc)
        # Still return generic success (don't reveal internal errors)
        return GENERIC_RESPONSE

    # Send the email
    sent = send_password_reset_email(
        to_email   = user["email"],
        user_name  = user["name"],
        reset_token= raw_token,
    )
    if not sent:
        logger.warning("[FORGOT-PW] Email send failed for user %s", user["id"])

    logger.info("[FORGOT-PW] Reset token issued for user %s", user["id"])
    return GENERIC_RESPONSE


# ── Reset Password ────────────────────────────────────────────────────────────

@router.post("/reset-password", response_model=ResetPasswordOut)
def reset_password(data: ResetPasswordIn, db=Depends(get_supabase)):
    """
    Complete password reset with a valid token.
    """
    # 1. Validate password strength
    pwd_err = _validate_password_strength(data.new_password)
    if pwd_err:
        raise HTTPException(status_code=422, detail=pwd_err)

    # 2. Look up the token record
    try:
        result = (
            db.table("password_resets")
            .select("*")
            .eq("token", data.token)
            .eq("used", False)
            .execute()
        )
    except Exception as exc:
        logger.error("[RESET-PW] DB lookup failed: %s", exc)
        raise HTTPException(status_code=500, detail="Server error. Please try again.")

    if not result.data:
        raise HTTPException(status_code=400, detail="Invalid or already-used reset link.")

    record = result.data[0]

    # 3. Check expiry
    try:
        expires_at = datetime.fromisoformat(record["expires_at"].replace("Z", "+00:00"))
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid token record.")

    if datetime.now(timezone.utc) > expires_at:
        # Clean up expired token
        db.table("password_resets").delete().eq("id", record["id"]).execute()
        raise HTTPException(status_code=400, detail="Reset link has expired. Please request a new one.")

    # 4. Look up the user
    user_result = db.table("users").select("*").eq("id", record["user_id"]).execute()
    if not user_result.data:
        raise HTTPException(status_code=404, detail="User not found.")
    user = user_result.data[0]

    # 5. Prevent reuse of the same password
    if verify_password(data.new_password, user["hashed_password"]):
        raise HTTPException(
            status_code=400,
            detail="New password cannot be the same as your current password.",
        )

    # 6. Hash and update the password
    new_hash = hash_password(data.new_password)
    db.table("users").update({"hashed_password": new_hash}).eq("id", user["id"]).execute()

    # 7. Invalidate the token (mark as used + delete)
    db.table("password_resets").update({"used": True}).eq("id", record["id"]).execute()
    db.table("password_resets").delete().eq("id", record["id"]).execute()

    logger.info("[RESET-PW] Password reset successful for user %s", user["id"])
    return {"message": "Password reset successfully. You can now sign in with your new password."}


# ── Verify Token (for frontend pre-validation) ────────────────────────────────

@router.get("/verify-reset-token")
def verify_reset_token(token: str, db=Depends(get_supabase)):
    """
    Lightweight endpoint: check if a reset token is valid & not expired.
    Returns 200 OK with {valid: true} or {valid: false, reason: "..."}.
    """
    try:
        result = (
            db.table("password_resets")
            .select("expires_at, used")
            .eq("token", token)
            .execute()
        )
    except Exception:
        return {"valid": False, "reason": "server_error"}

    if not result.data:
        return {"valid": False, "reason": "not_found"}

    record = result.data[0]
    if record.get("used"):
        return {"valid": False, "reason": "already_used"}

    try:
        expires_at = datetime.fromisoformat(record["expires_at"].replace("Z", "+00:00"))
    except Exception:
        return {"valid": False, "reason": "invalid_record"}

    if datetime.now(timezone.utc) > expires_at:
        return {"valid": False, "reason": "expired"}

    return {"valid": True}

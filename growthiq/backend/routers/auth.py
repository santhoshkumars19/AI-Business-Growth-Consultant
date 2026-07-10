"""
Authentication router for GrowthIQ AI.
Includes: register, login, me, forgot-password, reset-password
"""

import os
import logging
from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, HTTPException, Depends, Request
from fastapi.responses import JSONResponse

from db.supabase import get_supabase
from schemas.models import (
    UserRegister, UserLogin, TokenOut, UserOut,
    ForgotPasswordIn, ForgotPasswordOut, GoogleLoginIn,
)
from middleware.auth import (
    hash_password, verify_password, create_access_token, get_current_user
)
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


@router.post("/google", response_model=TokenOut)
def google_login(data: GoogleLoginIn, db=Depends(get_supabase)):
    """
    Verify Google credentials (ID Token) and sign in/up the user.
    """
    from google.oauth2 import id_token
    from google.auth.transport import requests as google_requests
    import secrets

    client_id = os.getenv("GOOGLE_CLIENT_ID", "")
    if not client_id:
        raise HTTPException(
            status_code=500,
            detail="Google Client ID is not configured in backend environment."
        )

    try:
        # Verify the ID token securely using google-auth library
        idinfo = id_token.verify_oauth2_token(
            data.credential,
            google_requests.Request(),
            client_id
        )
    except Exception as exc:
        raise HTTPException(
            status_code=400,
            detail=f"Google login failed: {str(exc)}"
        )

    email = idinfo.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Google token has no email address.")

    name = idinfo.get("name", email.split("@")[0])
    picture = idinfo.get("picture")
    now_str = datetime.now(timezone.utc).isoformat()

    # Check if the user already exists in the database
    user_query = db.table("users").select("*").eq("email", email).execute()
    
    if user_query.data:
        # User exists
        user = user_query.data[0]
        update_data = {}
        
        # Link normal account to Google if not already linked
        try:
            update_data["last_login"] = now_str
            if user.get("auth_provider") != "google":
                update_data["auth_provider"] = "google"
            if picture and not user.get("profile_picture"):
                update_data["profile_picture"] = picture

            update_res = db.table("users").update(update_data).eq("id", user["id"]).execute()
            if update_res.data:
                user = update_res.data[0]
        except Exception:
            # Fallback if optional schema columns are not present in supabase yet
            pass
    else:
        # Create a new Google user
        user_id = str(uuid.uuid4())
        # Generate a random password hash for Google users
        random_pwd_hash = hash_password(secrets.token_urlsafe(32))

        insert_data = {
            "id": user_id,
            "name": name,
            "email": email,
            "hashed_password": random_pwd_hash,
            "plan": "starter",
            "role": "user",
        }
        
        try:
            insert_data["auth_provider"] = "google"
            insert_data["profile_picture"] = picture
            insert_data["last_login"] = now_str
            insert_res = db.table("users").insert(insert_data).execute()
        except Exception:
            # Fallback if optional schema columns are not present in supabase yet
            insert_data.pop("auth_provider", None)
            insert_data.pop("profile_picture", None)
            insert_data.pop("last_login", None)
            insert_res = db.table("users").insert(insert_data).execute()

        if not insert_res.data:
            raise HTTPException(status_code=500, detail="Failed to create Google user in database.")
        user = insert_res.data[0]

    # Generate access token
    token = create_access_token({
        "sub": user["id"],
        "email": user["email"],
        "role": user["role"],
        "plan": user["plan"]
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": UserOut(**user)
    }


@router.get("/me", response_model=UserOut)
def get_me(current_user: dict = Depends(get_current_user), db=Depends(get_supabase)):
    result = db.table("users").select("*").eq("id", current_user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(**result.data[0])


# ── Forgot Password (Direct Reset) ───────────────────────────────────────────

@router.post("/forgot-password", response_model=ForgotPasswordOut)
def forgot_password(data: ForgotPasswordIn, db=Depends(get_supabase)):
    """
    Direct forgot password reset.
    Validates email existence, checks password requirements, hashes securely, and updates the DB.
    """
    # 1. Validate password strength
    pwd_err = _validate_password_strength(data.new_password)
    if pwd_err:
        raise HTTPException(status_code=422, detail=pwd_err)

    # 2. Check if user exists in the database
    result = db.table("users").select("*").eq("email", data.email).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="Email not found")

    user = result.data[0]

    # 3. Block admin account from self-service reset
    if user["email"].lower() == ADMIN_EMAIL.lower():
        raise HTTPException(
            status_code=400,
            detail="Admin password cannot be reset via the public form."
        )

    # 4. Prevent reuse of the same password
    if verify_password(data.new_password, user["hashed_password"]):
        raise HTTPException(
            status_code=400,
            detail="New password cannot be the same as your current password."
        )

    # 5. Hash new password securely using bcrypt and update the database
    new_hash = hash_password(data.new_password)
    try:
        db.table("users").update({"hashed_password": new_hash}).eq("id", user["id"]).execute()
    except Exception as exc:
        logger.error("[FORGOT-PW] DB update failed: %s", exc)
        raise HTTPException(
            status_code=500,
            detail="Failed to update password in database. Please try again."
        )

    logger.info("[FORGOT-PW] Password updated directly for user %s", user["id"])
    return {"message": "Password updated successfully."}


from fastapi import APIRouter, HTTPException, Depends
from db.supabase import get_supabase
from schemas.models import UserRegister, UserLogin, TokenOut, UserOut
from middleware.auth import hash_password, verify_password, create_access_token, get_current_user
import uuid

router = APIRouter()

# ── Hardcoded Admin Credentials ───────────────────────────────────────────────
ADMIN_EMAIL = "admin@growthiq.com"
ADMIN_PASSWORD = "Admin@123"
ADMIN_NAME = "GrowthIQ Admin"


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
        "id": admin_id, "name": ADMIN_NAME, "email": ADMIN_EMAIL, "plan": "scale", "role": "admin"
    }


@router.post("/register", response_model=TokenOut)
def register(data: UserRegister, db=Depends(get_supabase)):
    if data.email.lower() == ADMIN_EMAIL.lower():
        raise HTTPException(status_code=400, detail="This email is reserved.")
    existing = db.table("users").select("id").eq("email", data.email).execute()
    if existing.data:
        raise HTTPException(status_code=400, detail="Email already registered")
    user_id = str(uuid.uuid4())
    hashed = hash_password(data.password)
    result = db.table("users").insert({
        "id": user_id,
        "name": data.name,
        "email": data.email,
        "hashed_password": hashed,
        "plan": "starter",
        "role": "user"
    }).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create user")
    user = result.data[0]
    token = create_access_token({"sub": user["id"], "email": user["email"], "role": user["role"], "plan": user["plan"]})
    return {"access_token": token, "token_type": "bearer", "user": UserOut(**user)}


@router.post("/login", response_model=TokenOut)
def login(data: UserLogin, db=Depends(get_supabase)):
    # ── Admin shortcut ────────────────────────────────────────────────────────
    if data.email.lower() == ADMIN_EMAIL.lower():
        if data.password != ADMIN_PASSWORD:
            raise HTTPException(status_code=401, detail="Invalid admin credentials")
        user = _ensure_admin_exists(db)
        token = create_access_token({"sub": user["id"], "email": user["email"], "role": "admin", "plan": user.get("plan", "scale")})
        return {"access_token": token, "token_type": "bearer", "user": UserOut(**user)}

    # ── Normal user login ─────────────────────────────────────────────────────
    result = db.table("users").select("*").eq("email", data.email).execute()
    if not result.data:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    user = result.data[0]
    if not verify_password(data.password, user["hashed_password"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token({"sub": user["id"], "email": user["email"], "role": user["role"], "plan": user["plan"]})
    return {"access_token": token, "token_type": "bearer", "user": UserOut(**user)}


@router.get("/me", response_model=UserOut)
def get_me(current_user: dict = Depends(get_current_user), db=Depends(get_supabase)):
    result = db.table("users").select("*").eq("id", current_user["id"]).execute()
    if not result.data:
        raise HTTPException(status_code=404, detail="User not found")
    return UserOut(**result.data[0])


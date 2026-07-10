from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class UserRegister(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "user"


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    plan: str
    role: str
    profile_picture: Optional[str] = None
    auth_provider: Optional[str] = "local"
    last_login: Optional[datetime] = None
    created_at: Optional[datetime] = None


class GoogleLoginIn(BaseModel):
    credential: str


class TokenOut(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class BusinessDataIn(BaseModel):
    business_name: str
    industry: str
    city: Optional[str] = None
    state: str = "Tamil Nadu"
    monthly_revenue: float = 0
    monthly_expenses: float = 0
    monthly_customers: int = 0
    avg_order_value: float = 0
    growth_rate: float = 0
    profit_margin: float = 0
    online_presence: str = "none"
    employee_count: int = 1
    years_in_business: float = 0


class BusinessDataOut(BusinessDataIn):
    id: str
    user_id: str
    created_at: Optional[datetime] = None


class AnalysisOut(BaseModel):
    id: str
    user_id: str
    health_score: int
    score_breakdown: dict
    recommendations: list
    swot: dict
    marketing_plan: list
    seo_tips: list
    competitor_insights: dict
    budget_allocation: dict
    content_calendar: list
    summary: Optional[str] = None
    created_at: Optional[datetime] = None


class PaymentOrderIn(BaseModel):
    plan: str
    addons: list = []


class PaymentVerifyIn(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str


class FeedbackIn(BaseModel):
    type: str = "general"
    priority: str = "medium"
    message: str


class FeedbackOut(FeedbackIn):
    id: str
    user_id: str
    status: str
    created_at: Optional[datetime] = None


# ── Password Reset Schemas ────────────────────────────────────────────────────

class ForgotPasswordIn(BaseModel):
    email: EmailStr
    new_password: str


class ForgotPasswordOut(BaseModel):
    message: str

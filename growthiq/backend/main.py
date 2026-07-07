import sys
# Python 3.14 Protobuf compatibility workaround:
# Bypasses native C++ extensions check that crashes on Python 3.14.
sys.modules['google._upb._message'] = None
sys.modules['google.protobuf.pyext._message'] = None

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import os

load_dotenv()

from routers import auth, business, analysis, features, payments, reports, admin

app = FastAPI(
    title="GrowthIQ AI API",
    description="Backend API for GrowthIQ AI Business Growth Consultant",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# ── CORS ──────────────────────────────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        os.getenv("FRONTEND_URL", "http://localhost:3000"),
        "http://localhost:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routers ───────────────────────────────────────────────────────────────────
PREFIX = "/api/v1"

app.include_router(auth.router,      prefix=f"{PREFIX}/auth",     tags=["Auth"])
app.include_router(business.router,  prefix=f"{PREFIX}/business",  tags=["Business"])
app.include_router(analysis.router,  prefix=f"{PREFIX}/analysis",  tags=["Analysis"])
app.include_router(features.router,  prefix=f"{PREFIX}/features",  tags=["Features"])
app.include_router(payments.router,  prefix=f"{PREFIX}/payments",  tags=["Payments"])
app.include_router(reports.router,   prefix=f"{PREFIX}/reports",   tags=["Reports"])
app.include_router(admin.router,     prefix=f"{PREFIX}/admin",     tags=["Admin"])

# ── Health Check ──────────────────────────────────────────────────────────────
@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "healthy",
        "service": "GrowthIQ AI API",
        "version": "1.0.0"
    }

@app.get("/", tags=["Root"])
def root():
    return {
        "message": "Welcome to GrowthIQ AI API",
        "docs": "/docs",
        "health": "/health"
    }

-- GrowthIQ AI — Supabase SQL Schema
-- Run this in your Supabase SQL Editor (supabase.com → SQL Editor → New Query)

-- ── USERS ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    hashed_password TEXT NOT NULL,
    plan TEXT DEFAULT 'starter' CHECK (plan IN ('starter', 'growth', 'scale')),
    role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
    is_active BOOLEAN DEFAULT TRUE,
    profile_picture TEXT,
    auth_provider TEXT DEFAULT 'local',
    last_login TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── BUSINESS DATA ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS business_data (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    industry TEXT NOT NULL,
    city TEXT,
    state TEXT DEFAULT 'Tamil Nadu',
    monthly_revenue NUMERIC DEFAULT 0,
    monthly_expenses NUMERIC DEFAULT 0,
    monthly_customers INTEGER DEFAULT 0,
    avg_order_value NUMERIC DEFAULT 0,
    growth_rate NUMERIC DEFAULT 0,
    profit_margin NUMERIC DEFAULT 0,
    online_presence TEXT DEFAULT 'none' CHECK (online_presence IN ('none', 'basic', 'active', 'strong')),
    employee_count INTEGER DEFAULT 1,
    years_in_business NUMERIC DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── ANALYSES ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    health_score INTEGER DEFAULT 0,
    score_breakdown JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    swot JSONB DEFAULT '{}',
    marketing_plan JSONB DEFAULT '[]',
    seo_tips JSONB DEFAULT '[]',
    competitor_insights JSONB DEFAULT '{}',
    budget_allocation JSONB DEFAULT '{}',
    content_calendar JSONB DEFAULT '[]',
    summary TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── GROWTH SCORES ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS growth_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    month TEXT NOT NULL,
    score INTEGER NOT NULL,
    delta INTEGER DEFAULT 0,
    badges JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PAYMENTS ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    razorpay_order_id TEXT,
    razorpay_payment_id TEXT,
    amount INTEGER NOT NULL,
    currency TEXT DEFAULT 'INR',
    plan TEXT NOT NULL,
    addons JSONB DEFAULT '[]',
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed', 'refunded')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── FEEDBACK ─────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT DEFAULT 'general' CHECK (type IN ('bug', 'feature', 'compliment', 'general')),
    priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    message TEXT NOT NULL,
    status TEXT DEFAULT 'new' CHECK (status IN ('new', 'in-review', 'resolved', 'closed')),
    admin_reply TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── PASSWORD RESETS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS password_resets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ── INDEXES ──────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_business_user ON business_data(user_id);
CREATE INDEX IF NOT EXISTS idx_analyses_user ON analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_user ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_growth_scores_user ON growth_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_password_resets_token ON password_resets(token);

-- ── ROW LEVEL SECURITY (Disabled by default as backend API manages security) ──
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE business_data DISABLE ROW LEVEL SECURITY;
ALTER TABLE analyses DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE feedback DISABLE ROW LEVEL SECURITY;
ALTER TABLE growth_scores DISABLE ROW LEVEL SECURITY;
ALTER TABLE password_resets DISABLE ROW LEVEL SECURITY;

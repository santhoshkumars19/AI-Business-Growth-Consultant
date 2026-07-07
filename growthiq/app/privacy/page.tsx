'use client';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

export default function PrivacyPage() {
  const { theme, toggle } = useTheme();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(16px)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>⚡</div>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>GrowthIQ<span style={{ color: 'var(--accent-primary)' }}> AI</span></span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/pricing" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Pricing</Link>
          <button onClick={toggle} className="btn btn-ghost btn-sm" style={{ fontSize: '1rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          <Link href="/auth/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link href="/auth/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* Content */}
      <section style={{ padding: '60px 24px' }}>
        <div style={{ maxWidth: 800, margin: '0 auto', background: 'var(--bg-surface)', borderRadius: 16, border: '1px solid var(--border)', padding: '40px 32px' }}>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Privacy Policy</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 24 }}>Last updated: July 5, 2026</p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, fontSize: '0.9rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>
            <p>
              At GrowthIQ AI, accessible from http://localhost:3000, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by GrowthIQ AI and how we use it.
            </p>

            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 10 }}>1. Information We Collect</h2>
            <p>
              When you register for an Account, we may ask for your contact information, including items such as your name, business name, address, email address, and telephone number. We also collect the operational business metrics (revenue, expenses, employee count) that you input during onboarding to run AI consulting reports.
            </p>

            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 10 }}>2. How We Use Your Information</h2>
            <p>
              We use the collected information to:
            </p>
            <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
              <li>Provide, operate, and maintain our consulting platform.</li>
              <li>Improve, personalise, and expand our AI analysis services.</li>
              <li>Understand and analyse how you use our application to optimize features.</li>
              <li>Develop new products, services, features, and functionality.</li>
              <li>Communicate with you for customer support, updates, and marketing.</li>
            </ul>

            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: 10 }}>3. Data Retention and Safety</h2>
            <p>
              All operational metrics are stored securely in Supabase with role-based restrictions. We do not sell or lease your business financial numbers to third-party advertising brokers. Data is processed solely to generate your consulting PDF reports and SWOT timelines.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', padding: '40px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>⚡</div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem' }}>GrowthIQ<span style={{ color: 'var(--accent-primary)' }}> AI</span></span>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {['About','Blog','Privacy','Terms','Contact'].map(l => (
              <Link key={l} href={`/${l.toLowerCase()}`} style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {l}
              </Link>
            ))}
            <Link href="/pricing" style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', fontWeight: 600 }}>Pricing</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>© 2026 GrowthIQ AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

const features = [
  { icon: '🧠', title: 'AI-Powered Analysis', desc: 'Upload your metrics and get instant, personalised insights tailored to your industry.' },
  { icon: '📊', title: 'Visual Dashboards', desc: 'Charts, scores, and trends in real time — all in one beautiful, unified view.' },
  { icon: '🚀', title: 'Growth Recommendations', desc: 'Specific, data-backed steps you can start executing today, not generic advice.' },
  { icon: '📅', title: 'Monthly Tracking', desc: 'Log in each month, see your progress, and stay motivated with milestone badges.' },
  { icon: '🔍', title: 'Competitor Intelligence', desc: 'Know exactly where you stand and uncover gaps your competitors are missing.' },
  { icon: '📄', title: 'PDF Reports', desc: 'Download and share professional business reports with investors and partners.' },
];

const navLinks = [
  { href: '/about',   label: 'About'   },
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog',    label: 'Blog'    },
  { href: '/contact', label: 'Contact' },
];

export default function LandingPage() {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', overflowX: 'hidden' }}>

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        padding: '0 16px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'var(--bg-surface)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        transition: 'all 0.3s ease',
        gap: 8,
      }}>
        {/* Brand */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>⚡</div>
          <span className="hide-mobile" style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            GrowthIQ<span style={{ color: 'var(--accent-primary)' }}> AI</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        <div className="hide-mobile-flex" style={{ alignItems: 'center', gap: 4, flex: 1, justifyContent: 'center' }}>
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} style={{ padding: '6px 14px', borderRadius: 8, color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.15s', whiteSpace: 'nowrap' }}>
              {l.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button onClick={toggle} className="btn btn-ghost btn-sm" style={{ padding: '6px 10px', fontSize: '1rem' }}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <Link href="/auth/login" className="btn btn-ghost btn-sm hide-mobile">Sign In</Link>
          <Link href="/auth/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: 60 }}>
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 'clamp(200px, 30vw, 400px)', height: 'clamp(200px, 30vw, 400px)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 'clamp(250px, 35vw, 500px)', height: 'clamp(250px, 35vw, 500px)', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '60px 16px', textAlign: 'center' }}>
          <div className="animate-fade-up">
            <div className="badge badge-primary" style={{ marginBottom: 16 }}>✨ AI-Powered Business Growth</div>
            <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(2rem, 6vw, 4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 20 }}>
              Turn Your Business Data Into{' '}
              <span className="gradient-text">Unstoppable Growth</span>
            </h1>
            <p style={{ fontSize: 'clamp(0.95rem, 2vw, 1.15rem)', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 32, maxWidth: 520, margin: '0 auto 32px' }}>
              AI-powered insights. Actionable recommendations. Monthly progress tracking — all built specifically for your business metrics.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 16 }}>
              <Link href="/auth/register" className="btn btn-primary btn-xl">🚀 Start Free Analysis</Link>
              <Link href="/auth/login" className="btn btn-secondary btn-xl">Sign In →</Link>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 12 }}>🔒 Free to start. No credit card required.</p>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div className="badge badge-primary" style={{ marginBottom: 12 }}>Everything you need</div>
            <h2 style={{ fontSize: 'clamp(1.5rem, 4vw, 2.25rem)', fontWeight: 800, marginBottom: 12 }}>Built for business owners, not data scientists</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.875rem, 2vw, 1.05rem)', maxWidth: 540, margin: '0 auto' }}>No complex setup. No technical skills needed. Just input your numbers and let AI do the heavy lifting.</p>
          </div>
          <div className="grid-3" style={{ gap: 16 }}>
            {features.map((f, i) => (
              <div key={i} className="card feature-card p-6" style={{ background: 'var(--gradient-card)', animationDelay: `${i * 0.1}s` }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── visible on all screen sizes ── */}
      <footer style={{
        background: 'var(--bg-surface)',
        borderTop: '1px solid var(--border)',
        padding: '28px 16px',
      }}>
        <div style={{ maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, textAlign: 'center' }}>
          {/* Brand */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem' }}>⚡</div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1rem' }}>
              GrowthIQ<span style={{ color: 'var(--accent-primary)' }}> AI</span>
            </span>
          </div>

          {/* Nav links — always visible including mobile */}
          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 20px', justifyContent: 'center' }}>
            {navLinks.map(l => (
              <Link
                key={l.href}
                href={l.href}
                style={{
                  fontSize: '0.9rem',
                  fontWeight: 500,
                  color: 'var(--text-secondary)',
                  transition: 'color 0.15s',
                  textDecoration: 'none',
                  padding: '4px 2px',
                }}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Copyright */}
          <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', margin: 0 }}>
            © 2026 GrowthIQ AI. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}

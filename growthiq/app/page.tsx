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
  { href: '/about', label: 'About' },
  { href: '/pricing', label: 'Pricing' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export default function LandingPage() {
  const { theme, toggle } = useTheme();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('body-lock');
    } else {
      document.body.classList.remove('body-lock');
    }
    return () => document.body.classList.remove('body-lock');
  }, [menuOpen]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', overflowX: 'hidden' }}>

      {/* ── MOBILE MENU OVERLAY ── */}
      {menuOpen && (
        <>
          <div className="mobile-menu-overlay" onClick={() => setMenuOpen(false)} />
          <div className="mobile-menu-panel">
            <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>⚡</div>
                <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem' }}>GrowthIQ<span style={{ color: 'var(--accent-primary)' }}> AI</span></span>
              </div>
              <button onClick={() => setMenuOpen(false)} style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--bg-elevated)', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', color: 'var(--text-secondary)' }}>✕</button>
            </div>
            <nav style={{ padding: '16px 12px', flex: 1 }}>
              {navLinks.map(l => (
                <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                  style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', borderRadius: 10, color: 'var(--text-primary)', fontWeight: 500, fontSize: '0.95rem', marginBottom: 4, transition: 'background 0.15s' }}>
                  {l.label}
                </Link>
              ))}
            </nav>
            <div style={{ padding: '16px 20px 24px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link href="/auth/login" onClick={() => setMenuOpen(false)} className="btn btn-ghost btn-lg btn-full">Sign In</Link>
              <Link href="/auth/register" onClick={() => setMenuOpen(false)} className="btn btn-primary btn-lg btn-full">Get Started Free</Link>
            </div>
          </div>
        </>
      )}

      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        padding: '0 16px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'var(--bg-surface)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 30, height: 30, borderRadius: 7, background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>⚡</div>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.15rem', color: 'var(--text-primary)' }}>GrowthIQ<span style={{ color: 'var(--accent-primary)' }}> AI</span></span>
        </Link>

        {/* Desktop Nav */}
        <div className="hide-mobile-flex" style={{ alignItems: 'center', gap: 6 }}>
          {navLinks.map(l => (
            <Link key={l.href} href={l.href} style={{ padding: '6px 14px', borderRadius: 8, color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500, transition: 'color 0.15s' }}>{l.label}</Link>
          ))}
        </div>

        {/* Desktop Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={toggle} className="btn btn-ghost btn-sm" style={{ padding: '6px 10px', fontSize: '1rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          <Link href="/auth/login" className="btn btn-ghost btn-sm hide-mobile">Sign In</Link>
          <Link href="/auth/register" className="btn btn-primary btn-sm">Get Started</Link>
          {/* Hamburger — mobile only */}
          <button className={`hamburger hide-desktop ${menuOpen ? 'open' : ''}`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span /><span /><span />
          </button>
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

    </div>
  );
}

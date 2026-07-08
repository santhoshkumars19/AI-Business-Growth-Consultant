'use client';
import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';

// Trigger Vercel rebuild
const features = [
  { icon: '🧠', title: 'AI-Powered Analysis', desc: 'Upload your metrics and get instant, personalised insights tailored to your industry.' },
  { icon: '📊', title: 'Visual Dashboards', desc: 'Charts, scores, and trends in real time — all in one beautiful, unified view.' },
  { icon: '🚀', title: 'Growth Recommendations', desc: 'Specific, data-backed steps you can start executing today, not generic advice.' },
  { icon: '📅', title: 'Monthly Tracking', desc: 'Log in each month, see your progress, and stay motivated with milestone badges.' },
  { icon: '🔍', title: 'Competitor Intelligence', desc: 'Know exactly where you stand and uncover gaps your competitors are missing.' },
  { icon: '📄', title: 'PDF Reports', desc: 'Download and share professional business reports with investors and partners.' },
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
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* ── NAVBAR ── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 200,
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: scrolled ? 'var(--bg-surface)' : 'transparent',
        borderBottom: scrolled ? '1px solid var(--border)' : 'none',
        backdropFilter: scrolled ? 'blur(16px)' : 'none',
        transition: 'all 0.3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>⚡</div>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>GrowthIQ<span style={{ color: 'var(--accent-primary)' }}> AI</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <button onClick={toggle} className="btn btn-ghost btn-sm" style={{ padding: '6px 10px', fontSize: '1rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          <Link href="/auth/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link href="/auth/register" className="btn btn-primary btn-sm">Get Started Free</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative', overflow: 'hidden', paddingTop: 64 }}>
        {/* Background gradient orbs */}
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%)', pointerEvents: 'none' }} />

        <div className="container" style={{ position: 'relative', zIndex: 1, padding: '80px 24px', textAlign: 'center' }}>
          <div className="animate-fade-up">
              <div className="badge badge-primary" style={{ marginBottom: 20 }}>✨ AI-Powered Business Growth</div>
              <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, lineHeight: 1.1, marginBottom: 24 }}>
                Turn Your Business Data Into{' '}
                <span className="gradient-text">Unstoppable Growth</span>
              </h1>
              <p style={{ fontSize: '1.15rem', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: 36, maxWidth: 480, textAlign: 'center', margin: '0 auto 36px' }}>
                AI-powered insights. Actionable recommendations. Monthly progress tracking — all built specifically for your business metrics.
              </p>              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginBottom: 40, justifyContent: 'center' }}>
                <Link href="/auth/register" className="btn btn-primary btn-xl">🚀 Start Free Analysis</Link>
              </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div className="badge badge-primary" style={{ marginBottom: 14 }}>Everything you need</div>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: 14 }}>Built for business owners, not data scientists</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 540, margin: '0 auto' }}>No complex setup. No technical skills needed. Just input your numbers and let AI do the heavy lifting.</p>
          </div>
          <div className="grid-3" style={{ gap: 20 }}>
            {features.map((f, i) => (
              <div key={i} className="card feature-card p-6" style={{ background: 'var(--gradient-card)', animationDelay: `${i * 0.1}s` }}>
                <div style={{ fontSize: '2rem', marginBottom: 14 }}>{f.icon}</div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, marginBottom: 8 }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.65 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>









      {/* ── FOOTER ── */}
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

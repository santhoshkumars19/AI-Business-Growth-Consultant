'use client';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

export default function AboutPage() {
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

      {/* Hero */}
      <section style={{ padding: '80px 24px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '10%', left: '5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <div className="badge badge-primary" style={{ marginBottom: 16 }}>Our Story</div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(2rem, 4vw, 3.5rem)', fontWeight: 800, marginBottom: 20 }}>
            Democratising World-Class Consulting for{' '}
            <span className="gradient-text">Every Business</span>
          </h1>
          <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: 1.7, maxWidth: 600, margin: '0 auto' }}>
            At GrowthIQ AI, we believe premium business consulting shouldn't cost lakhs. Our AI-driven platform puts elite strategic tools, data intelligence, and execution-ready plans into the hands of local startup founders and SMB owners.
          </p>
        </div>
      </section>

      {/* Pillars / Values */}
      <section className="section" style={{ background: 'var(--bg-elevated)' }}>
        <div className="container" style={{ maxWidth: 1000 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: 8 }}>Our Core Pillars</h2>
            <p style={{ color: 'var(--text-secondary)' }}>The standards that guide our technology and advisory outputs.</p>
          </div>
          <div className="grid-3" style={{ gap: 24 }}>
            {[
              { icon: '🎯', title: 'Action over Clutter', desc: 'We deliver step-by-step instructions and metrics you can execute today. No fluffy paragraphs or generic slide decks.' },
              { icon: '🇮🇳', title: 'Locally Tailored', desc: 'Built explicitly to align with the regional taxations, consumer behavior, and marketing channels in Tamil Nadu and wider India.' },
              { icon: '🔐', title: 'Data Security First', desc: 'Your operational metrics and database records are private, fully encrypted, and securely managed under strict local standards.' }
            ].map((p, idx) => (
              <div key={idx} className="card p-6" style={{ background: 'var(--bg-surface)' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>{p.icon}</div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 8 }}>{p.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineHeight: 1.6 }}>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '60px 24px' }}>
        <div className="container" style={{ maxWidth: 800, display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 30, textAlign: 'center' }}>
          {[
            { num: '5,000+', label: 'Indian Businesses Analysed' },
            { num: '₹12Cr+', label: 'Revenue Growth Unlocked' },
            { num: '98%', label: 'CSAT Recommendation Score' }
          ].map((s, idx) => (
            <div key={idx}>
              <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'Outfit' }}>{s.num}</div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
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

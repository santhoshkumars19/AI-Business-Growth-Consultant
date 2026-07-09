'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

export default function ContactPage() {
  const { theme, toggle } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [type, setType] = useState('general');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;
    setLoading(true);

    try {
      // POST feedback directly to the backend
      const res = await fetch('http://127.0.0.1:8000/api/v1/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, type, message })
      });
      if (res.ok) {
        setSuccess(true);
        setName(''); setEmail(''); setMessage('');
      } else {
        alert('Failed to send message. Please try again.');
      }
    } catch (err) {
      console.error(err);
      alert('Failed to send message. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        padding: '0 16px', height: 60,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(16px)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.95rem' }}>⚡</div>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>GrowthIQ<span style={{ color: 'var(--accent-primary)' }}> AI</span></span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Link href="/pricing" className="hide-mobile" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Pricing</Link>
          <button onClick={toggle} className="btn btn-ghost btn-sm" style={{ fontSize: '1rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          <Link href="/auth/login" className="btn btn-ghost btn-sm hide-mobile">Sign In</Link>
          <Link href="/auth/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* Content */}
      <section style={{ padding: 'clamp(32px, 6vw, 60px) 16px' }}>
        <div className="grid-2" style={{ maxWidth: 960, margin: '0 auto', alignItems: 'start', gap: 40 }}>
          {/* Info Card */}
          <div style={{ padding: '20px 0' }}>
            <div className="badge badge-primary" style={{ marginBottom: 16 }}>Contact Us</div>
            <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(2rem, 3.5vw, 2.75rem)', fontWeight: 800, marginBottom: 20 }}>
              Let's build something <span className="gradient-text">together</span>
            </h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: 30 }}>
              Have questions about subscription plans, custom brand templates, or bulk APIs? Fill in the form or reach out directly to our support coordinates.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.4rem' }}>📍</span>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Location</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Chennai, Tamil Nadu, India</div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.4rem' }}>✉️</span>
                <div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Email</div>
                  <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>support@growthiq.ai</div>
                </div>
              </div>
            </div>
          </div>

          {/* Form Card */}
          <div className="card p-6" style={{ background: 'var(--bg-surface)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20 }}>Send a Message</h2>
            {success ? (
              <div style={{ textAlign: 'center', padding: '30px 10px' }}>
                <div style={{ fontSize: '3rem', marginBottom: 12 }}>🎉</div>
                <h3 style={{ fontWeight: 700, marginBottom: 6 }}>Message Sent Successfully!</h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20 }}>We will review your message and reply via email within 24 hours.</p>
                <button onClick={() => setSuccess(false)} className="btn btn-ghost btn-sm">Send another message</button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                <div className="input-group">
                  <label className="input-label">Full Name</label>
                  <input className="input" value={name} onChange={e => setName(e.target.value)} required placeholder="Priya Sharma" />
                </div>
                <div className="input-group">
                  <label className="input-label">Email Address</label>
                  <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required placeholder="priya@domain.in" />
                </div>
                <div className="input-group">
                  <label className="input-label">Query Type</label>
                  <select className="input" value={type} onChange={e => setType(e.target.value)}>
                    <option value="general">General Query</option>
                    <option value="bug">Report a Bug</option>
                    <option value="feature">Request a Feature</option>
                    <option value="compliment">Leave a Compliment</option>
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Message</label>
                  <textarea className="input" rows={4} value={message} onChange={e => setMessage(e.target.value)} required placeholder="How can we help you?" style={{ resize: 'vertical' }} />
                </div>
                <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                  {loading ? 'Sending...' : '✉️ Send Message'}
                </button>
              </form>
            )}
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

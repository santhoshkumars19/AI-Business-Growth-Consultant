'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function ForgotPasswordPage() {
  const { fetchWithAuth } = useAuth();
  const { theme, toggle } = useTheme();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetchWithAuth('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setSuccess(res.message || 'If an account exists, a reset link has been sent.');
      setEmail('');
    } catch (err: any) {
      setError(err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left Panel — hidden on mobile */}
      <div className="auth-panel-left">
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 420 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>🔑</div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#fff', marginBottom: 16 }}>Forgot your password?</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 36 }}>No worries. Enter your registered email address and we will send you a secure link to reset your password.</p>
          <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: 12, padding: '16px 20px', textAlign: 'left' }}>
            <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>
              🛡️ For security reasons, reset tokens expire after 15 minutes and can only be used once.
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="auth-panel-right">
        <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>⚡</div>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>GrowthIQ</span>
            </Link>
            <button onClick={toggle} className="btn btn-ghost btn-sm" style={{ fontSize: '1rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          </div>

          <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(1.5rem, 4vw, 1.875rem)', fontWeight: 800, marginBottom: 6 }}>Reset password</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>Enter your email address to receive a secure password reset link.</p>

          {error && <div style={{ background: 'rgba(var(--accent-danger-rgb),0.1)', border: '1px solid var(--accent-danger)', borderRadius: 10, padding: '12px 16px', color: 'var(--accent-danger)', fontSize: '0.875rem', marginBottom: 20 }}>⚠️ {error}</div>}
          {success && <div style={{ background: 'rgba(var(--accent-success-rgb),0.1)', border: '1px solid var(--accent-success)', borderRadius: 10, padding: '12px 16px', color: 'var(--accent-success)', fontSize: '0.875rem', marginBottom: 20 }}>✅ {success}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="input-group">
              <label className="input-label">Email address</label>
              <input className="input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" disabled={loading} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-full" style={{ marginTop: 4 }} disabled={loading}>
              {loading ? 'Sending request...' : 'Send Reset Link'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.9rem', marginTop: 24 }}>
            Remembered your password? <Link href="/auth/login" className="link" style={{ fontWeight: 600 }}>Sign back in →</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

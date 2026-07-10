'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

function PasswordStrength({ password }: { password: string }) {
  const score = [password.length >= 8, /[A-Z]/.test(password), /[0-9]/.test(password), /[^A-Za-z0-9]/.test(password)].filter(Boolean).length;
  const labels = ['', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['', 'var(--accent-danger)', 'var(--accent-warning)', 'var(--accent-primary)', 'var(--accent-success)'];
  if (!password) return null;
  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1,2,3,4].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= score ? colors[score] : 'var(--bg-elevated)', transition: 'all 0.3s ease' }} />
        ))}
      </div>
      <div style={{ fontSize: '0.75rem', color: colors[score], fontWeight: 600 }}>{labels[score]}</div>
    </div>
  );
}

export default function RegisterPage() {
  const { register } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (!agreed) { setError('Please accept the Terms of Service.'); return; }
    setLoading(true); setError('');
    try {
      await register(form.email, form.password, form.name, 'user');
      router.push('/onboarding');
    } catch {
      setError('Registration failed. Please make sure the email format is correct.');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-layout">
      {/* Left Panel — hidden on mobile */}
      <div className="auth-panel-left">
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 420 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>🚀</div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: 800, color: '#fff', marginBottom: 16 }}>Start your growth journey today</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 32 }}>Join 2,400+ entrepreneurs who use GrowthIQ AI to make smarter business decisions every month.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['✅ Free 14-day trial, no credit card','✅ AI analysis in under 5 seconds','✅ Specific recommendations for your business','✅ Monthly progress tracking & milestones'].map(item => (
              <div key={item} style={{ background: 'rgba(255,255,255,0.1)', borderRadius: 10, padding: '10px 16px', color: '#fff', fontSize: '0.875rem', textAlign: 'left' }}>{item}</div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Panel — Form */}
      <div className="auth-panel-right">
        <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 26 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>⚡</div>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>GrowthIQ</span>
            </Link>
            <button onClick={toggle} className="btn btn-ghost btn-sm" style={{ fontSize: '1rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          </div>

          <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(1.4rem, 4vw, 1.875rem)', fontWeight: 800, marginBottom: 6 }}>Create your account</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 22 }}>Already have one? <Link href="/auth/login" className="link">Sign in →</Link></p>

          {error && <div style={{ background: 'rgba(var(--accent-danger-rgb),0.1)', border: '1px solid var(--accent-danger)', borderRadius: 10, padding: '12px 16px', color: 'var(--accent-danger)', fontSize: '0.875rem', marginBottom: 18 }}>⚠️ {error}</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <input className="input" type="text" placeholder="Enter your full name" value={form.name} onChange={e => set('name', e.target.value)} required />
            </div>
            <div className="input-group">
              <label className="input-label">Email address</label>
              <input className="input" type="email" placeholder="you@company.com" value={form.email} onChange={e => set('email', e.target.value)} required autoComplete="email" />
            </div>
            <div className="input-group">
              <label className="input-label">Password</label>
              <input className="input" type="password" placeholder="Create a strong password" value={form.password} onChange={e => set('password', e.target.value)} required />
              <PasswordStrength password={form.password} />
            </div>
            <div className="input-group">
              <label className="input-label">Confirm Password</label>
              <input className="input" type="password" placeholder="Repeat your password" value={form.confirm} onChange={e => set('confirm', e.target.value)} required style={{ borderColor: form.confirm && form.confirm !== form.password ? 'var(--accent-danger)' : '' }} />
              {form.confirm && form.confirm !== form.password && <div className="error-msg">Passwords don't match</div>}
            </div>
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer', margin: '6px 0 2px' }}>
              <input type="checkbox" checked={agreed} onChange={e => setAgreed(e.target.checked)} style={{ accentColor: 'var(--accent-primary)', marginTop: 3, flexShrink: 0 }} />
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                I agree to the <Link href="/terms" className="link">Terms of Service</Link> and <Link href="/privacy" className="link">Privacy Policy</Link>
              </span>
            </label>
            <button type="submit" className="btn btn-primary btn-lg btn-full" style={{ marginTop: 4 }} disabled={loading}>
              {loading ? 'Creating account...' : 'Sign Up as User →'}
            </button>
          </form>

          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 22 }}>🔒 All data is securely processed and encrypted.</p>
        </div>
      </div>
    </div>
  );
}

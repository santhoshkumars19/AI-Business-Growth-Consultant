'use client';
import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

function PasswordStrength({ password }: { password: string }) {
  const requirements = [
    password.length >= 8,
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = requirements.filter(Boolean).length;
  const labels = ['', 'Very Weak', 'Weak', 'Fair', 'Strong', 'Very Strong'];
  const colors = ['', 'var(--accent-danger)', 'var(--accent-danger)', 'var(--accent-warning)', 'var(--accent-primary)', 'var(--accent-success)'];

  if (!password) return null;

  return (
    <div style={{ marginTop: 8 }}>
      <div style={{ display: 'flex', gap: 4, marginBottom: 4 }}>
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= score ? colors[score] : 'var(--bg-elevated)', transition: 'all 0.3s ease' }} />
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.75rem', color: colors[score], fontWeight: 600 }}>{labels[score]}</span>
        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{score}/5 Criteria Met</span>
      </div>
      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: 4, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2px 8px' }}>
        <div style={{ color: requirements[0] ? 'var(--accent-success)' : '' }}>• Min 8 chars</div>
        <div style={{ color: requirements[1] ? 'var(--accent-success)' : '' }}>• Uppercase (A-Z)</div>
        <div style={{ color: requirements[2] ? 'var(--accent-success)' : '' }}>• Lowercase (a-z)</div>
        <div style={{ color: requirements[3] ? 'var(--accent-success)' : '' }}>• Number (0-9)</div>
        <div style={{ color: requirements[4] ? 'var(--accent-success)' : '', gridColumn: 'span 2' }}>• Special character (!@#$%^&*)</div>
      </div>
    </div>
  );
}

function ResetPasswordForm() {
  const { fetchWithAuth } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
  const [verifying, setVerifying] = useState(true);

  // Validate the token on mount
  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      setVerifying(false);
      return;
    }

    const checkToken = async () => {
      try {
        const res = await fetchWithAuth(`/auth/verify-reset-token?token=${token}`);
        setIsValidToken(res.valid);
        if (!res.valid) {
          setError(
            res.reason === 'expired'
              ? 'This reset link has expired. Please request a new one.'
              : 'This reset link is invalid or has already been used.'
          );
        }
      } catch (err) {
        setIsValidToken(false);
        setError('Could not verify your reset token. Please request a new link.');
      } finally {
        setVerifying(false);
      }
    };

    checkToken();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!token) {
      setError('Missing reset token. Please request a new link.');
      return;
    }

    // Client-side validations
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError('Password must contain at least one uppercase letter.');
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError('Password must contain at least one lowercase letter.');
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError('Password must contain at least one number.');
      return;
    }
    if (!/[^A-Za-z0-9]/.test(password)) {
      setError('Password must contain at least one special character.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await fetchWithAuth('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ token, new_password: password }),
      });
      setSuccess(res.message || 'Password reset successfully!');
      setTimeout(() => {
        router.push('/auth/login');
      }, 3000);
    } catch (err: any) {
      setError(err?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '300px', gap: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--bg-elevated)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Verifying reset token...</p>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      {/* Left Panel */}
      <div className="auth-panel-left">
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 420 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>🔒</div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#fff', marginBottom: 16 }}>Choose a secure password</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 36 }}>Keep your business dashboard safe. Combine uppercase, lowercase, numbers, and special characters to build a strong password.</p>
          <div style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: 12, padding: '16px 20px', textAlign: 'left' }}>
            <span style={{ fontSize: '0.85rem', color: '#fff', fontWeight: 500 }}>
              🛡️ Choose a password that you do not use on other websites.
            </span>
          </div>
        </div>
      </div>

      {/* Right Panel */}
      <div className="auth-panel-right">
        <div style={{ maxWidth: 420, width: '100%', margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>⚡</div>
              <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>GrowthIQ</span>
            </Link>
            <button onClick={toggle} className="btn btn-ghost btn-sm" style={{ fontSize: '1rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          </div>

          <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(1.5rem, 4vw, 1.875rem)', fontWeight: 800, marginBottom: 6 }}>Set new password</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>Enter your new secure password below to regain dashboard access.</p>

          {error && <div style={{ background: 'rgba(var(--accent-danger-rgb),0.1)', border: '1px solid var(--accent-danger)', borderRadius: 10, padding: '12px 16px', color: 'var(--accent-danger)', fontSize: '0.875rem', marginBottom: 20 }}>⚠️ {error}</div>}
          {success && <div style={{ background: 'rgba(var(--accent-success-rgb),0.1)', border: '1px solid var(--accent-success)', borderRadius: 10, padding: '12px 16px', color: 'var(--accent-success)', fontSize: '0.875rem', marginBottom: 20 }}>✅ {success}</div>}

          {isValidToken ? (
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div className="input-group">
                <label className="input-label">New Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    className="input"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Create a strong password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    disabled={loading}
                    style={{ paddingRight: 40 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '0.9rem', outline: 'none' }}
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
                <PasswordStrength password={password} />
              </div>
              <div className="input-group">
                <label className="input-label">Confirm New Password</label>
                <input
                  className="input"
                  type="password"
                  placeholder="Repeat your password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  required
                  disabled={loading}
                  style={{ borderColor: confirm && confirm !== password ? 'var(--accent-danger)' : '' }}
                />
                {confirm && confirm !== password && <div style={{ fontSize: '0.75rem', color: 'var(--accent-danger)', marginTop: 4 }}>Passwords do not match</div>}
              </div>
              <button type="submit" className="btn btn-primary btn-lg btn-full" style={{ marginTop: 4 }} disabled={loading}>
                {loading ? 'Updating Password...' : 'Save New Password'}
              </button>
            </form>
          ) : (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <Link href="/auth/forgot-password" className="btn btn-primary btn-lg btn-full">
                Request New Reset Link
              </Link>
            </div>
          )}

          <p style={{ textAlign: 'center', fontSize: '0.9rem', marginTop: 24 }}>
            Go back to <Link href="/auth/login" className="link" style={{ fontWeight: 600 }}>Sign In</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: 'var(--bg-base)', gap: 16 }}>
        <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid var(--bg-elevated)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Loading reset page...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}

'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

export default function LoginPage() {
  const { login, loginWithGoogle } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAccountChooser, setShowAccountChooser] = useState(false);
  const [customGoogleEmail, setCustomGoogleEmail] = useState('');
  const [customGoogleName, setCustomGoogleName] = useState('');

  // Handle Google OAuth callback from URL hash
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const parseHash = async () => {
      const hash = window.location.hash;
      if (!hash) return;

      // Extract parameter values from hash
      const params = new URLSearchParams(hash.substring(1));
      const idToken = params.get('id_token');
      const err = params.get('error');

      // Clear hash from address bar immediately
      window.history.replaceState(null, '', window.location.pathname);

      if (err) {
        setError(`Google login canceled or failed: ${err.replace(/_/g, ' ')}`);
        return;
      }

      if (idToken) {
        setGoogleLoading(true);
        setError('');
        try {
          const authUser = await loginWithGoogle(idToken);
          if (authUser.role === 'admin') {
            router.push('/admin/users');
          } else {
            router.push('/dashboard');
          }
        } catch (err: any) {
          setError(err?.message || 'Google authentication failed. Please try again.');
        } finally {
          setGoogleLoading(false);
        }
      }
    };

    parseHash();
  }, [router, loginWithGoogle]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const authUser = await login(email, password);
      if (authUser.role === 'admin') {
        router.push('/admin/users');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Invalid credentials. Please check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectMockAccount = async (name: string, email: string) => {
    setShowAccountChooser(false);
    setGoogleLoading(true);
    setError('');
    try {
      const slugName = name.replace(/\s+/g, '-');
      const mockToken = `mock_google_token_${email}_${slugName}`;
      
      const authUser = await loginWithGoogle(mockToken);
      if (authUser.role === 'admin' || email === 'alex.mercer@gmail.com') {
        router.push('/admin/users');
      } else {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err?.message || 'Google authentication failed.');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleCustomGoogleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customGoogleEmail.trim()) return;
    const name = customGoogleName.trim() || customGoogleEmail.split('@')[0];
    handleSelectMockAccount(name, customGoogleEmail.trim());
  };

  const handleGoogleLogin = async () => {
    setError('');
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '1087459152342-g1h2j3k4l5m6n7o8p9q0.apps.googleusercontent.com';
    
    setGoogleLoading(true);

    const isMock = !process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 
                   clientId.includes('googleclientid') || 
                   clientId.startsWith('1087459152342-');
                   
    if (isMock) {
      setShowAccountChooser(true);
      return;
    }

    try {
      const redirectUri = `${window.location.origin}/auth/login`;
      const nonce = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      
      // Save nonce locally to verify if needed
      sessionStorage.setItem('google_oauth_nonce', nonce);

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId)}` +
        `&redirect_uri=${encodeURIComponent(redirectUri)}` +
        `&response_type=id_token` +
        `&scope=openid%20email%20profile` +
        `&nonce=${encodeURIComponent(nonce)}`;

      window.location.href = authUrl;
    } catch (err: any) {
      setError('Failed to initiate Google sign-in. Please try again.');
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-layout">
      {/* Left Panel */}
      <div className="auth-panel-left">
        <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'absolute', bottom: -80, left: -80, width: 300, height: 300, borderRadius: '50%', background: 'rgba(255,255,255,0.05)' }} />
        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: 420 }}>
          <div style={{ fontSize: '3.5rem', marginBottom: 20 }}>⚡</div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: 'clamp(1.5rem, 3vw, 2.25rem)', fontWeight: 800, color: '#fff', marginBottom: 16 }}>Welcome back to GrowthIQ AI</h2>
          <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: '1rem', lineHeight: 1.7, marginBottom: 36 }}>Your business insights are waiting. Sign in to check your growth score and latest AI recommendations.</p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            {[['📊', 'Visual Dashboards'], ['🎯', 'AI Recommendations'], ['📈', 'Growth Tracking'], ['📄', 'PDF Reports']].map(([icon, label]) => (
              <div key={label} style={{ background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)', borderRadius: 12, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: '1.25rem' }}>{icon}</span>
                <span style={{ color: '#fff', fontSize: '0.85rem', fontWeight: 500 }}>{label}</span>
              </div>
            ))}
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

          <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(1.5rem, 4vw, 1.875rem)', fontWeight: 800, marginBottom: 6 }}>Sign in</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>Don&apos;t have an account? <Link href="/auth/register" className="link">Create one free &rarr;</Link></p>

          {error && <div style={{ background: 'rgba(var(--accent-danger-rgb),0.1)', border: '1px solid var(--accent-danger)', borderRadius: 10, padding: '12px 16px', color: 'var(--accent-danger)', fontSize: '0.875rem', marginBottom: 20 }}>⚠️ {error}</div>}
          {googleLoading && <div style={{ background: 'rgba(var(--accent-primary-rgb),0.1)', border: '1px solid var(--accent-primary)', borderRadius: 10, padding: '12px 16px', color: 'var(--accent-primary)', fontSize: '0.875rem', marginBottom: 20 }}>⚡ Authenticating with Google...</div>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div className="input-group">
              <label className="input-label">Email address</label>
              <input className="input" type="email" placeholder="you@company.com" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" disabled={loading || googleLoading} />
            </div>
            <div className="input-group">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <label className="input-label">Password</label>
                <Link href="/auth/forgot-password" className="link" style={{ fontSize: '0.8rem' }}>Forgot password?</Link>
              </div>
              <input className="input" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" disabled={loading || googleLoading} />
            </div>
            <button type="submit" className="btn btn-primary btn-lg btn-full" style={{ marginTop: 4 }} disabled={loading || googleLoading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '24px 0' }}>
            <div className="divider" /><span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>or continue with</span><div className="divider" />
          </div>

          <button 
            type="button" 
            onClick={handleGoogleLogin} 
            className="btn btn-ghost btn-lg btn-full" 
            style={{ gap: 10 }} 
            disabled={loading || googleLoading}
          >
            {googleLoading ? (
              <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2px solid var(--text-muted)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            )}
            {googleLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 24 }}>🔒 Your data is encrypted and never shared.</p>
        </div>
      </div>

      {showAccountChooser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 16,
            padding: 28,
            maxWidth: 400,
            width: '90%',
            boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="20" height="20" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, margin: 0 }}>Choose an account</h3>
              </div>
              <button 
                onClick={() => { setShowAccountChooser(false); setGoogleLoading(false); }} 
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.25rem' }}
              >
                ×
              </button>
            </div>
            
            <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 20 }}>
              to continue to <strong style={{ color: 'var(--text-primary)' }}>GrowthIQ AI</strong>
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                { name: 'Sarah Jenkins', email: 'sarah.jenkins@company.com', pic: '👩‍💼', desc: 'Standard Business User' },
                { name: 'Alex Mercer', email: 'alex.mercer@gmail.com', pic: '👨‍💻', desc: 'System Administrator' },
                { name: 'David Miller', email: 'david.miller@startup.io', pic: '🧑‍🚀', desc: 'New Starter Account' }
              ].map(acc => (
                <button
                  key={acc.email}
                  onClick={() => handleSelectMockAccount(acc.name, acc.email)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: 12,
                    borderRadius: 12,
                    background: 'var(--bg-elevated)',
                    border: '1px solid var(--border)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    width: '100%',
                    transition: 'all 0.2s ease',
                  }}
                >
                  <div style={{ fontSize: '1.5rem', width: 36, height: 36, borderRadius: '50%', background: 'var(--bg-surface)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid var(--border)' }}>
                    {acc.pic}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>{acc.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{acc.email}</div>
                  </div>
                  <span style={{ fontSize: '0.65rem', color: 'var(--accent-primary)', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 6px', borderRadius: 4, fontWeight: 600 }}>
                    {acc.desc.split(' ')[0]}
                  </span>
                </button>
              ))}
            </div>

            <form onSubmit={handleCustomGoogleSubmit} style={{ marginTop: 16, borderTop: '1px solid var(--border)', paddingTop: 16 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>Or use your own Google account details:</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 12 }}>
                <input 
                  type="email" 
                  placeholder="Email Address" 
                  value={customGoogleEmail} 
                  onChange={e => setCustomGoogleEmail(e.target.value)} 
                  className="input" 
                  style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                  required
                />
                <input 
                  type="text" 
                  placeholder="Full Name (Optional)" 
                  value={customGoogleName} 
                  onChange={e => setCustomGoogleName(e.target.value)} 
                  className="input" 
                  style={{ fontSize: '0.8rem', padding: '8px 12px' }}
                />
              </div>
              <button type="submit" className="btn btn-primary btn-sm btn-full" style={{ fontSize: '0.8rem', padding: '8px 14px' }}>
                Sign In with Custom Account
              </button>
            </form>

            <div style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 16 }}>
              🔒 Simulated Google Account Chooser
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

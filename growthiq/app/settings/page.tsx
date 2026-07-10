'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const glass = {
  background: 'var(--bg-surface)',
  border: '1px solid var(--border)',
  borderRadius: 16,
  padding: 24,
  boxShadow: 'var(--shadow-sm)',
  marginBottom: 24,
};

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { theme, toggle } = useTheme();

  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [infoMessage, setInfoMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [pwMessage, setPwMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savingPw, setSavingPw] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
  }, [user]);

  const handleUpdateInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setInfoMessage({ text: 'Name cannot be empty.', type: 'error' });
      return;
    }

    setSavingInfo(true);
    setInfoMessage(null);
    try {
      await updateProfile({ name: name.trim() });
      setInfoMessage({ text: 'Profile name updated successfully!', type: 'success' });
    } catch (err: any) {
      setInfoMessage({ text: err.message || 'Failed to update profile.', type: 'error' });
    } finally {
      setSavingInfo(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      setPwMessage({ text: 'Password cannot be empty.', type: 'error' });
      return;
    }
    if (password !== confirmPassword) {
      setPwMessage({ text: 'Passwords do not match.', type: 'error' });
      return;
    }

    setSavingPw(true);
    setPwMessage(null);
    try {
      await updateProfile({ password });
      setPwMessage({ text: 'Password updated successfully!', type: 'success' });
      setPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPwMessage({ text: err.message || 'Failed to update password.', type: 'error' });
    } finally {
      setSavingPw(false);
    }
  };

  if (!user) {
    return (
      <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>
        Please log in to view settings.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', color: 'var(--text-primary)' }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(1.3rem, 3vw, 1.75rem)', fontWeight: 800, color: 'var(--text-primary)', marginBottom: 4 }}>
          ⚙️ Account Settings
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Manage your personal details, security, and theme preferences
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 24 }}>
        
        {/* Personal Details */}
        <div style={glass}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            👤 Personal Details
          </h2>
          <form onSubmit={handleUpdateInfo}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Email Address</label>
              <input 
                type="text" 
                value={user.email} 
                disabled 
                className="input" 
                style={{ background: 'var(--bg-elevated)', cursor: 'not-allowed', color: 'var(--text-muted)', fontSize: '0.875rem' }} 
              />
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', display: 'block', marginTop: 4 }}>Email address cannot be changed.</span>
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Full Name</label>
              <input 
                type="text" 
                value={name} 
                onChange={e => setName(e.target.value)} 
                className="input" 
                style={{ fontSize: '0.875rem' }}
                placeholder="Enter your full name"
                required
              />
            </div>

            {infoMessage && (
              <div style={{ 
                padding: '10px 14px', 
                borderRadius: 8, 
                fontSize: '0.82rem', 
                marginBottom: 16,
                background: infoMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: infoMessage.type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)',
                border: `1px solid ${infoMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
              }}>
                {infoMessage.text}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ minWidth: 120 }} disabled={savingInfo}>
              {savingInfo ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>

        {/* Change Password */}
        <div style={glass}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
            🔑 Change Password
          </h2>
          <form onSubmit={handleUpdatePassword}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>New Password</label>
              <input 
                type="password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className="input" 
                style={{ fontSize: '0.875rem' }}
                placeholder="Minimum 8 characters, with capital & special character"
                required
              />
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Confirm New Password</label>
              <input 
                type="password" 
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)} 
                className="input" 
                style={{ fontSize: '0.875rem' }}
                placeholder="Retype new password"
                required
              />
            </div>

            {pwMessage && (
              <div style={{ 
                padding: '10px 14px', 
                borderRadius: 8, 
                fontSize: '0.82rem', 
                marginBottom: 16,
                background: pwMessage.type === 'success' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                color: pwMessage.type === 'success' ? 'var(--accent-success)' : 'var(--accent-danger)',
                border: `1px solid ${pwMessage.type === 'success' ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`
              }}>
                {pwMessage.text}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ minWidth: 150 }} disabled={savingPw}>
              {savingPw ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Preferences (Theme & Business Data) */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24 }}>
          
          {/* Theme Preference */}
          <div style={glass}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>🌓 App Theme</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Toggle between light and dark visual aesthetics for GrowthIQ.
            </p>
            <button onClick={toggle} className="btn btn-ghost" style={{ width: '100%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {theme === 'dark' ? '☀️ Switch to Light Mode' : '🌙 Switch to Dark Mode'}
            </button>
          </div>

          {/* Business Metrics */}
          <div style={glass}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 12 }}>🏢 Business Profile</h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginBottom: 20 }}>
              Update your baseline financial and marketing metrics to refresh AI dashboard analyses.
            </p>
            <Link href="/onboarding" className="btn btn-ghost" style={{ width: '100%', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              📝 Configure Business Metrics
            </Link>
          </div>
        </div>


      </div>
    </div>
  );
}

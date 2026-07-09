'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

const adminNav = [
  { href: '/admin/users', icon: '👥', label: 'Users' },
  { href: '/admin/analytics', icon: '📊', label: 'Analytics' },
  { href: '/admin/ai-usage', icon: '🤖', label: 'AI Usage' },
  { href: '/admin/revenue', icon: '💳', label: 'Revenue' },
  { href: '/admin/feedback', icon: '💬', label: 'Feedback' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Checking credentials...</p>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-base)', padding: 24, textAlign: 'center' }}>
        <div className="card p-8" style={{ maxWidth: 440, width: '100%', background: 'var(--bg-surface)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🛡️</div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-danger)', marginBottom: 12 }}>Access Denied</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 24 }}>
            This section is restricted to administrators. To access these dashboards, your account role must be promoted to <strong>admin</strong> in Supabase.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/dashboard" className="btn btn-primary btn-full">🏠 Back to Dashboard</Link>
            <Link href="/auth/login" className="btn btn-ghost btn-full">🔄 Switch Account</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Topbar */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 56, position: 'sticky', top: 0, zIndex: 100, gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <div style={{ width: 24, height: 24, borderRadius: 6, background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>⚡</div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.95rem' }}>GrowthIQ</span>
          </Link>
          <span style={{ padding: '2px 8px', background: 'rgba(var(--accent-danger-rgb),0.12)', color: 'var(--accent-danger)', borderRadius: 6, fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>🛡️ ADMIN</span>
        </div>

        {/* Desktop Nav — hidden on mobile */}
        <div className="admin-nav-items" style={{ flex: 1, justifyContent: 'center' }}>
          {adminNav.map(n => (
            <Link key={n.href} href={n.href} style={{ padding: '6px 12px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 500, background: pathname === n.href ? 'var(--accent-primary)' : 'transparent', color: pathname === n.href ? '#fff' : 'var(--text-secondary)', transition: 'all 0.15s ease', display: 'flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap' }}>
              <span>{n.icon}</span><span>{n.label}</span>
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <button onClick={toggle} className="btn btn-ghost btn-sm">{theme === 'dark' ? '☀️' : '🌙'}</button>
          {/* Hamburger for mobile */}
          <button
            className="hamburger hide-desktop"
            onClick={() => setMobileNavOpen(!mobileNavOpen)}
            aria-label="Toggle admin nav"
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile Admin Nav Dropdown */}
      {mobileNavOpen && (
        <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '8px 16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          {adminNav.map(n => (
            <Link key={n.href} href={n.href} onClick={() => setMobileNavOpen(false)} style={{ padding: '10px 14px', borderRadius: 10, fontSize: '0.875rem', fontWeight: 500, background: pathname === n.href ? 'rgba(var(--accent-primary-rgb),0.1)' : 'transparent', color: pathname === n.href ? 'var(--accent-primary)' : 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 10 }}>
              <span>{n.icon}</span><span>{n.label}</span>
            </Link>
          ))}
        </div>
      )}

      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '16px' }}>
        {children}
      </div>
    </div>
  );
}

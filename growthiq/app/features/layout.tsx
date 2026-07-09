'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { href: '/analysis', icon: '📊', label: 'AI Analysis' },
  { href: '/features/swot', icon: '📋', label: 'SWOT Analysis' },
  { href: '/features/growth-score', icon: '📈', label: 'Growth Score' },
  { href: '/features/marketing-plan', icon: '📅', label: 'Marketing Plan' },
  { href: '/features/seo-audit', icon: '🔎', label: 'SEO Audit' },
  { href: '/features/competitor-analysis', icon: '⚔️', label: 'Competitors' },
  { href: '/features/content-calendar', icon: '📱', label: 'Content Calendar' },
  { href: '/features/budget-estimator', icon: '💰', label: 'Budget Estimator' },
  { href: '/progress', icon: '📉', label: 'Progress Tracking' },
];

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [greeting, setGreeting] = useState('Good morning');

  const handleLogout = () => { logout(); router.push('/'); };
  const initial = user?.name?.[0]?.toUpperCase() || 'U';

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12) setGreeting('Good morning');
    else if (hr < 17) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.classList.add('body-lock');
    else document.body.classList.remove('body-lock');
    return () => document.body.classList.remove('body-lock');
  }, [mobileOpen]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <div className="app-layout">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo */}
        <div style={{ padding: '20px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--border)', minHeight: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>⚡</div>
            <div className="nav-label">
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1rem', whiteSpace: 'nowrap' }}>GrowthIQ <span style={{ color: 'var(--accent-primary)' }}>AI</span></div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 1 }}>{user?.plan === 'growth' ? '⭐ Growth Plan' : '🌱 Starter'}</div>
            </div>
          </div>
          <button onClick={() => { setCollapsed(!collapsed); }} style={{ color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0, fontSize: '1rem', background: 'none', border: 'none', padding: 4 }}>
            {collapsed ? '→' : '←'}
          </button>
        </div>

        <div style={{ padding: '14px 16px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.875rem', flexShrink: 0 }}>{initial}</div>
          <div className="nav-label" style={{ overflow: 'hidden', flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.name || 'User'}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.businessData?.business_name || 'Add business data'}</div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {navItems.map(item => (
            <Link key={item.href} href={item.href} className={`nav-link ${pathname === item.href ? 'active' : ''}`} style={{ marginBottom: 2 }}>
              <span className="nav-icon" style={{ fontSize: '1rem' }}>{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}
          <div style={{ borderTop: '1px solid var(--border)', margin: '12px 8px' }} />
          <Link href="/features/pdf-export" className="nav-link" style={{ marginBottom: 2 }}>
            <span className="nav-icon">📄</span>
            <span className="nav-label">Download Report</span>
          </Link>
          <Link href="/admin/users" className="nav-link" style={{ marginBottom: 2 }}>
            <span className="nav-icon">🛡️</span>
            <span className="nav-label">Admin Panel</span>
          </Link>
        </nav>

        <div style={{ padding: '12px 8px', borderTop: '1px solid var(--border)' }}>
          <button onClick={handleLogout} className="nav-link" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--accent-danger)' }}>
            <span className="nav-icon" style={{ fontSize: '1rem' }}>🚪</span>
            <span className="nav-label">Sign Out</span>
          </button>
        </div>
      </aside>

      <main className={`main-content ${collapsed ? 'expanded' : ''}`}>
        <header className="topbar" style={{ justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Hamburger — mobile only */}
            <button
              className="hamburger hide-desktop"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle sidebar"
            >
              <span /><span /><span />
            </button>
            <div className="hide-mobile">
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{greeting}, {user?.name?.split(' ')[0] || 'there'}! 👋</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
            </div>
            <div className="hide-desktop" style={{ fontWeight: 600, fontSize: '0.875rem' }}>GrowthIQ AI</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={toggle} className="btn btn-ghost btn-sm" style={{ fontSize: '0.9rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
            <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }}>
              🔔
              <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-danger)', border: '2px solid var(--bg-surface)' }} />
            </button>
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowUserMenu(!showUserMenu)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-hero)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}>{initial}</button>
              {showUserMenu && (
                <div style={{ position: 'absolute', right: 0, top: 44, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', width: 200, padding: 8, zIndex: 100 }}>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                  </div>
                  <button onClick={() => { handleLogout(); setShowUserMenu(false); }}
                    style={{ width: '100%', padding: '8px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: 'var(--accent-danger)', borderRadius: 8, minHeight: 36 }}>
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
        <div className="page-content">{children}</div>
      </main>

      {/* Mobile Bottom Nav */}
      <div className="mobile-nav" style={{ justifyContent: 'space-around' }}>
        {navItems.slice(0, 5).map(item => (
          <Link key={item.href} href={item.href} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, padding: '4px 8px', color: pathname === item.href ? 'var(--accent-primary)' : 'var(--text-muted)', fontSize: '0.58rem', fontWeight: 600, flex: 1 }}>
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            {item.label.split(' ')[0]}
          </Link>
        ))}
      </div>
    </div>
  );
}

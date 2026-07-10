'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

const navItems = [
  { href: '/dashboard',                      icon: '🏠', label: 'Dashboard' },
  { href: '/analysis',                        icon: '📊', label: 'AI Analysis' },
  { href: '/features/swot',                   icon: '📋', label: 'SWOT Analysis' },
  { href: '/features/growth-score',           icon: '📈', label: 'Growth Score' },
  { href: '/features/marketing-plan',         icon: '📅', label: 'Marketing Plan' },
  { href: '/features/seo-audit',              icon: '🔎', label: 'SEO Audit' },
  { href: '/features/competitor-analysis',    icon: '⚔️',  label: 'Competitors' },
  { href: '/features/content-calendar',       icon: '📱', label: 'Content Calendar' },
  { href: '/features/budget-estimator',       icon: '💰', label: 'Budget Estimator' },
  { href: '/progress',                        icon: '📉', label: 'Progress Tracking' },
];

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  const pathname     = usePathname();
  const router       = useRouter();
  const { theme, toggle } = useTheme();
  const { user, logout }  = useAuth();

  const [collapsed,    setCollapsed]    = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [greeting,     setGreeting]     = useState('Good morning');

  const handleLogout = () => { logout(); router.push('/'); };
  const initial = user?.name?.[0]?.toUpperCase() || 'U';

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12)      setGreeting('Good morning');
    else if (hr < 17) setGreeting('Good afternoon');
    else              setGreeting('Good evening');
  }, []);

  useEffect(() => {
    if (mobileOpen) document.body.classList.add('body-lock');
    else            document.body.classList.remove('body-lock');
    return () => document.body.classList.remove('body-lock');
  }, [mobileOpen]);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <div className="app-layout">
      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${collapsed ? 'collapsed' : ''} ${mobileOpen ? 'mobile-open' : ''}`}>

        {/* ── Logo / Brand ── */}
        <div style={{
          padding: '18px 16px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid var(--border)',
          minHeight: 68, gap: 8,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, overflow: 'hidden', flex: 1 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 9,
              background: 'var(--gradient-hero)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', flexShrink: 0,
            }}>⚡</div>
            <div className="nav-label" style={{ overflow: 'hidden', lineHeight: 1.3 }}>
              <div style={{
                fontFamily: 'Outfit, sans-serif', fontWeight: 800,
                fontSize: '1.05rem', whiteSpace: 'nowrap',
                letterSpacing: '-0.3px',
              }}>
                GrowthIQ <span style={{ color: 'var(--accent-primary)' }}>AI</span>
              </div>
              <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 2, whiteSpace: 'nowrap' }}>
                {user?.plan === 'growth' ? '⭐ Growth Plan' : '🌱 Starter Plan'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            style={{
              color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0,
              fontSize: '0.85rem', lineHeight: 1, padding: '4px 6px',
              borderRadius: 6, background: 'var(--bg-elevated)',
              border: '1px solid var(--border)',
              transition: 'background 0.15s ease, color 0.15s ease',
            }}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* ── User Info ── */}
        <div style={{
          padding: '13px 16px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: 10,
        }}>
          <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: 'var(--gradient-hero)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
          }}>{initial}</div>
          <div className="nav-label" style={{ overflow: 'hidden', flex: 1, lineHeight: 1.35 }}>
            <div style={{
              fontWeight: 600, fontSize: '0.9rem',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>{user?.name || 'User'}</div>
            <div style={{
              fontSize: '0.72rem', color: 'var(--text-muted)',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 1,
            }}>{user?.businessData?.business_name || 'Add business data'}</div>
          </div>
        </div>

        {/* ── Navigation Links ── */}
        <nav style={{ flex: 1, padding: '10px 8px', overflowY: 'auto', overflowX: 'hidden' }}>
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`nav-link ${pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href)) ? 'active' : ''}`}
              style={{ marginBottom: 3 }}
            >
              <span className="nav-icon">{item.icon}</span>
              <span className="nav-label">{item.label}</span>
            </Link>
          ))}

          {/* Divider */}
          <div style={{ borderTop: '1px solid var(--border)', margin: '10px 6px' }} />

          <Link
            href="/features/pdf-export"
            className={`nav-link ${pathname === '/features/pdf-export' ? 'active' : ''}`}
            style={{ marginBottom: 3 }}
          >
            <span className="nav-icon">📄</span>
            <span className="nav-label">Download Report</span>
          </Link>
          <Link
            href="/admin/users"
            className={`nav-link ${pathname.startsWith('/admin') ? 'active' : ''}`}
            style={{ marginBottom: 3 }}
          >
            <span className="nav-icon">🛡️</span>
            <span className="nav-label">Admin Panel</span>
          </Link>
        </nav>

        {/* ── Bottom actions ── */}
        <div style={{ padding: '10px 8px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={handleLogout}
            className="nav-link"
            style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', color: 'var(--accent-danger)' }}
          >
            <span className="nav-icon">🚪</span>
            <span className="nav-label">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
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
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>
            </div>
            <div className="hide-desktop" style={{ fontWeight: 600, fontSize: '0.875rem' }}>GrowthIQ AI</div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button onClick={toggle} className="btn btn-ghost btn-sm" style={{ fontSize: '0.9rem' }}>
              {theme === 'dark' ? '☀️' : '🌙'}
            </button>
            <button className="btn btn-ghost btn-icon" style={{ position: 'relative' }}>
              🔔
              <div style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-danger)', border: '2px solid var(--bg-surface)' }} />
            </button>
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-hero)', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.875rem' }}
              >{initial}</button>
              {showUserMenu && (
                <div style={{ position: 'absolute', right: 0, top: 44, background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, boxShadow: 'var(--shadow-lg)', width: 200, padding: 8, zIndex: 100 }}>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', marginBottom: 8 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{user?.name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                  </div>
                  {[['⚙️ Settings', '#'], ['📄 Download Report', '/features/pdf-export'], ['🚪 Sign Out', 'logout']].map(([label, href]) => (
                    <button key={label}
                      onClick={() => { if (href === 'logout') handleLogout(); else { router.push(href); setShowUserMenu(false); } }}
                      style={{ width: '100%', padding: '8px 14px', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.875rem', color: href === 'logout' ? 'var(--accent-danger)' : 'var(--text-primary)', borderRadius: 8, display: 'block', minHeight: 36 }}
                    >{label}</button>
                  ))}
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
          <Link key={item.href} href={item.href} style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            gap: 3, padding: '4px 8px',
            color: pathname === item.href ? 'var(--accent-primary)' : 'var(--text-muted)',
            fontSize: '0.6rem', fontWeight: 600, flex: 1,
          }}>
            <span style={{ fontSize: '1.2rem' }}>{item.icon}</span>
            {item.label.split(' ')[0]}
          </Link>
        ))}
      </div>
    </div>
  );
}

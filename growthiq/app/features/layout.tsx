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

interface NotificationItem {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  href: string;
  created_at: string;
  read: boolean;
}

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
  const pathname     = usePathname();
  const router       = useRouter();
  const { theme, toggle } = useTheme();
  const { user, logout, fetchWithAuth }  = useAuth();

  const [collapsed,    setCollapsed]    = useState(false);
  const [mobileOpen,   setMobileOpen]   = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [greeting,     setGreeting]     = useState('Good morning');

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const handleLogout = () => { logout(); router.push('/'); };
  const initial = user?.name?.[0]?.toUpperCase() || 'U';

  useEffect(() => {
    if (!user) return;

    const loadNotifications = async () => {
      try {
        let items: NotificationItem[] = [];

        // 1. Welcome
        const signupDate = user.created_at ? new Date(user.created_at) : new Date(Date.now() - 24 * 60 * 60 * 1000);
        items.push({
          id: 'welcome',
          title: 'Welcome to GrowthIQ AI! 🌱',
          subtitle: 'Get started by running your first business analysis.',
          icon: '🌱',
          href: '/onboarding',
          created_at: signupDate.toISOString(),
          read: false,
        });

        // 2. Business Profile Status
        if (user.businessData) {
          items.push({
            id: 'business_configured',
            title: 'Business Profile Active 🏢',
            subtitle: `Metrics for ${user.businessData.business_name} are active.`,
            icon: '🏢',
            href: '/onboarding',
            created_at: signupDate.toISOString(),
            read: false,
          });
        }

        // 3. Plan Level
        items.push({
          id: 'plan_active',
          title: `${user.plan ? user.plan.charAt(0).toUpperCase() + user.plan.slice(1) : 'Starter'} Plan Active ⭐`,
          subtitle: 'You have full access to your plan features.',
          icon: '⭐',
          href: '/pricing',
          created_at: signupDate.toISOString(),
          read: false,
        });

        // 4. System updates
        items.push({
          id: 'system_update_v12',
          title: 'AI Engine v1.2 Active 🧠',
          subtitle: 'Model upgraded for SWOT & competitor intelligence.',
          icon: '🧠',
          href: '/dashboard',
          created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          read: false,
        });

        // 5. Fetch report history
        try {
          const historyReports = await fetchWithAuth('/analysis/history');
          if (Array.isArray(historyReports)) {
            historyReports.forEach((report: any) => {
              items.push({
                id: `report_${report.id}`,
                title: 'AI Analysis Report Ready 📊',
                subtitle: `Report for ${user.businessData?.business_name || 'your business'} has a health score of ${report.health_score}/100.`,
                icon: '📊',
                href: '/analysis',
                created_at: report.created_at,
                read: false,
              });
            });
          }
        } catch (e) {
          console.error('Error loading report history for notifications:', e);
        }

        // 6. If Admin, fetch registrations
        if (user.role === 'admin') {
          try {
            const adminNotifs = await fetchWithAuth('/admin/notifications');
            if (adminNotifs && Array.isArray(adminNotifs.notifications)) {
              adminNotifs.notifications.forEach((an: any, index: number) => {
                items.push({
                  id: `admin_reg_${index}_${an.created_at}`,
                  title: an.title,
                  subtitle: an.subtitle,
                  icon: '🔔',
                  href: '/admin/notifications',
                  created_at: an.created_at || new Date().toISOString(),
                  read: false,
                });
              });
            }
          } catch (e) {
            console.error('Error loading admin notifications:', e);
          }
        }

        // Sort by created_at desc
        items.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

        // Load read status from localStorage
        const readIds = JSON.parse(localStorage.getItem(`growthiq_read_${user.id}`) || '[]');
        const clearedIds = JSON.parse(localStorage.getItem(`growthiq_cleared_${user.id}`) || '[]');

        items = items
          .filter(item => !clearedIds.includes(item.id))
          .map(item => ({
            ...item,
            read: readIds.includes(item.id),
          }));

        setNotifications(items);
      } catch (err) {
        console.error('Failed to load notifications:', err);
      }
    };

    loadNotifications();
  }, [user]);

  // Click outside handler to close notifications dropdown
  useEffect(() => {
    if (!showNotifMenu) return;
    const closeMenu = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.notification-container')) {
        setShowNotifMenu(false);
      }
    };
    document.addEventListener('click', closeMenu);
    return () => document.removeEventListener('click', closeMenu);
  }, [showNotifMenu]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotificationClick = (item: NotificationItem) => {
    const readIds = JSON.parse(localStorage.getItem(`growthiq_read_${user?.id}`) || '[]');
    if (!readIds.includes(item.id)) {
      readIds.push(item.id);
      localStorage.setItem(`growthiq_read_${user?.id}`, JSON.stringify(readIds));
    }
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
    setShowNotifMenu(false);
    router.push(item.href);
  };

  const handleMarkAllAsRead = () => {
    const readIds = notifications.map(n => n.id);
    localStorage.setItem(`growthiq_read_${user?.id}`, JSON.stringify(readIds));
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const handleClearAll = () => {
    const clearedIds = notifications.map(n => n.id);
    localStorage.setItem(`growthiq_cleared_${user?.id}`, JSON.stringify(clearedIds));
    setNotifications([]);
  };

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
            <div className="notification-container" style={{ position: 'relative' }}>
              <button
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                className="btn btn-ghost btn-icon"
                style={{ position: 'relative' }}
              >
                🔔
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount}</span>
                )}
              </button>

              {showNotifMenu && (
                <div
                  className="notification-dropdown"
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 44,
                    background: 'var(--bg-surface)',
                    border: '1px solid var(--border)',
                    borderRadius: 16,
                    boxShadow: 'var(--shadow-lg)',
                    width: 320,
                    maxHeight: 400,
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 100,
                    overflow: 'hidden',
                    backdropFilter: 'blur(20px)',
                    animation: 'fadeIn 0.2s ease',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', borderBottom: '1px solid var(--border)' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>Notifications</span>
                    <div style={{ display: 'flex', gap: 12 }}>
                      {unreadCount > 0 && (
                        <button onClick={handleMarkAllAsRead} style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '0.75rem', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
                          Mark all read
                        </button>
                      )}
                      {notifications.length > 0 && (
                        <button onClick={handleClearAll} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '0.75rem', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ overflowY: 'auto', flex: 1, maxHeight: 340 }}>
                    {notifications.length === 0 ? (
                      <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: 8 }}>📭</div>
                        No notifications
                      </div>
                    ) : (
                      notifications.map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleNotificationClick(item)}
                          className="notification-item"
                          style={{
                            width: '100%',
                            background: item.read ? 'transparent' : 'rgba(var(--accent-primary-rgb), 0.04)',
                            borderBottom: '1px solid var(--border)',
                            borderLeft: item.read ? 'none' : '3px solid var(--accent-primary)',
                            display: 'flex',
                            alignItems: 'flex-start',
                            gap: 12,
                            padding: '12px 16px',
                            cursor: 'pointer',
                            transition: 'background 0.2s ease',
                            textAlign: 'left',
                          }}
                        >
                          <span style={{ fontSize: '1.25rem', marginTop: 2, flexShrink: 0 }}>{item.icon}</span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: '0.82rem', fontWeight: item.read ? 500 : 700, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                              {item.title}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', lineHeight: 1.3 }}>
                              {item.subtitle}
                            </div>
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', marginTop: 4 }}>
                              {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </div>
                          {!item.read && (
                            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)', marginTop: 6, flexShrink: 0 }} />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
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
      <style>{`
        .notification-item:hover {
          background: rgba(var(--accent-primary-rgb), 0.08) !important;
        }
        .notification-badge {
          position: absolute;
          top: -2px;
          right: -2px;
          min-width: 14px;
          height: 14px;
          border-radius: var(--radius-full);
          background: var(--accent-danger);
          color: #fff;
          font-size: 0.65rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--bg-surface);
          padding: 0 4px;
          box-sizing: content-box;
        }
        @media (max-width: 767px) {
          .notification-dropdown {
            position: fixed !important;
            left: 12px !important;
            right: 12px !important;
            width: auto !important;
            top: 60px !important;
            max-height: 400px !important;
            z-index: 9999 !important;
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

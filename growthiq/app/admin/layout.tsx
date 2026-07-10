'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const adminNav = [
  { href: '/admin',               icon: '🏠', label: 'Overview'       },
  { href: '/admin/users',         icon: '👥', label: 'Users'          },
  { href: '/admin/analytics',     icon: '📊', label: 'Analytics'      },
  { href: '/admin/reports',       icon: '📋', label: 'Reports'        },
  { href: '/admin/notifications',  icon: '🔔', label: 'Notifications'  },
  { href: '/admin/revenue',        icon: '💳', label: 'Revenue'        },
  { href: '/admin/ai-usage',       icon: '🤖', label: 'AI Usage'       },
  { href: '/admin/feedback',       icon: '💬', label: 'Feedback'       },
];

/* ─ Sidebar width constant – matches CSS var for desktop ─ */
const SIDEBAR_W = 260;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); router.push('/auth/login'); };

  /* ── Loading ── */
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>Verifying admin access...</p>
      </div>
    );
  }

  /* ── Access denied ── */
  if (!user || user.role !== 'admin') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', padding: 24, textAlign: 'center' }}>
        <div style={{ maxWidth: 440, width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 20, padding: 40, backdropFilter: 'blur(20px)' }}>
          <div style={{ fontSize: '3rem', marginBottom: 16 }}>🛡️</div>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '1.5rem', fontWeight: 800, color: '#ef4444', marginBottom: 12 }}>Access Denied</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: 24 }}>
            This section is restricted to administrators only. Please log in with admin credentials.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <Link href="/auth/login" style={{ display: 'block', padding: '12px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>🔑 Sign In</Link>
            <Link href="/dashboard" style={{ display: 'block', padding: '12px', background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.7)', borderRadius: 12, textDecoration: 'none', fontWeight: 600, fontSize: '0.9rem' }}>🏠 Back to Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0f', color: '#e2e8f0', display: 'flex' }}>

      {/* ── Sidebar ── */}
      <aside
        className="admin-sidebar"
        style={{
          width: SIDEBAR_W,
          flexShrink: 0,
          background: 'rgba(255,255,255,0.03)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          position: 'fixed',
          top: 0,
          /* Mobile: off-screen when closed; on-screen when open */
          left: sidebarOpen ? 0 : -SIDEBAR_W - 10,
          height: '100vh',
          zIndex: 200,
          transition: 'left 0.28s cubic-bezier(0.4,0,0.2,1), box-shadow 0.28s ease',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          boxShadow: sidebarOpen ? '4px 0 32px rgba(0,0,0,0.5)' : 'none',
        }}
      >
        {/* Brand */}
        <div style={{ padding: '20px 18px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none' }}
            onClick={() => setSidebarOpen(false)}>
            <div style={{
              width: 36, height: 36, borderRadius: 9,
              background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', flexShrink: 0,
            }}>⚡</div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '1.05rem', color: '#fff', whiteSpace: 'nowrap' }}>GrowthIQ</div>
              <div style={{ fontSize: '0.62rem', color: '#ef4444', fontWeight: 700, letterSpacing: '0.08em', whiteSpace: 'nowrap' }}>ADMIN PANEL</div>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto', overflowX: 'hidden' }}>
          {adminNav.map(n => (
            <Link
              key={n.href}
              href={n.href}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '11px 14px',
                borderRadius: 10,
                marginBottom: 3,
                textDecoration: 'none',
                /* Typography */
                fontSize: '0.9375rem',   /* 15px */
                fontWeight: isActive(n.href) ? 600 : 500,
                lineHeight: 1.5,
                letterSpacing: 0,
                /* No wrapping */
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                /* Colors */
                background: isActive(n.href)
                  ? 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.1))'
                  : 'transparent',
                color: isActive(n.href) ? '#818cf8' : 'rgba(255,255,255,0.55)',
                borderLeft: isActive(n.href) ? '2px solid #6366f1' : '2px solid transparent',
                /* Hover transition */
                transition: 'background 0.18s ease, color 0.18s ease, transform 0.12s ease',
                boxSizing: 'border-box',
                width: '100%',
              }}
            >
              {/* Icon cell — fixed size for alignment */}
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                width: 22, minWidth: 22, height: 22,
                fontSize: '1.05rem', flexShrink: 0, lineHeight: 1,
              }}>{n.icon}</span>
              {/* Label */}
              <span style={{
                flex: 1, minWidth: 0,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                fontSize: 'inherit', fontWeight: 'inherit', lineHeight: 1.5,
              }}>{n.label}</span>
            </Link>
          ))}
        </nav>

        {/* Admin profile */}
        <div style={{ padding: '14px 14px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'linear-gradient(135deg,#ef4444,#f97316)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontWeight: 700, fontSize: '0.9rem', flexShrink: 0,
            }}>{user.name?.[0] ?? 'A'}</div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: '0.68rem', color: '#ef4444', fontWeight: 700, marginTop: 1 }}>Administrator</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            style={{
              width: '100%', padding: '9px',
              background: 'rgba(239,68,68,0.1)',
              border: '1px solid rgba(239,68,68,0.2)',
              borderRadius: 8, color: '#ef4444',
              fontSize: '0.85rem', fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.15s ease',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            }}
          >
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(0,0,0,0.55)',
            zIndex: 199,
            backdropFilter: 'blur(3px)',
            WebkitBackdropFilter: 'blur(3px)',
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }} className="admin-main">

        {/* Topbar */}
        <header style={{
          height: 60,
          background: 'rgba(255,255,255,0.02)',
          borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center',
          padding: '0 20px', gap: 14,
          position: 'sticky', top: 0, zIndex: 100,
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          justifyContent: 'space-between',
          boxSizing: 'border-box',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Animated hamburger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: 4, display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}
              aria-label="Toggle sidebar"
            >
              <span style={{ display: 'block', width: 20, height: 2, background: 'currentColor', borderRadius: 2, transition: 'all 0.22s', transform: sidebarOpen ? 'rotate(45deg) translateY(6px)' : 'none' }} />
              <span style={{ display: 'block', width: 20, height: 2, background: 'currentColor', borderRadius: 2, opacity: sidebarOpen ? 0 : 1, transition: 'opacity 0.22s' }} />
              <span style={{ display: 'block', width: 20, height: 2, background: 'currentColor', borderRadius: 2, transition: 'all 0.22s', transform: sidebarOpen ? 'rotate(-45deg) translateY(-6px)' : 'none' }} />
            </button>
            <span style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 700, fontSize: '1rem', color: '#fff', whiteSpace: 'nowrap' }}>
              {adminNav.find(n => isActive(n.href))?.label ?? 'Admin'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ padding: '3px 10px', background: 'rgba(239,68,68,0.12)', color: '#ef4444', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700, whiteSpace: 'nowrap' }}>🛡️ ADMIN</span>
            <Link
              href="/dashboard"
              style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', borderRadius: 8, textDecoration: 'none', fontSize: '0.8rem', border: '1px solid rgba(255,255,255,0.08)', whiteSpace: 'nowrap' }}
            >
              ← User View
            </Link>
          </div>
        </header>

        <main style={{ flex: 1, padding: '24px 20px', overflowY: 'auto', maxWidth: 1400, width: '100%', margin: '0 auto', boxSizing: 'border-box' }}>
          {children}
        </main>
      </div>

      <style>{`
        /* Desktop: sidebar always visible, main content offset */
        @media (min-width: 768px) {
          .admin-sidebar {
            left: 0 !important;
            box-shadow: none !important;
          }
          .admin-main {
            margin-left: ${SIDEBAR_W}px;
          }
        }
        /* Tablet (768–1023px): sidebar still visible but content offset adjusted */
        @media (min-width: 768px) and (max-width: 1023px) {
          .admin-main {
            margin-left: ${SIDEBAR_W}px;
          }
        }
        /* Mobile: no offset, overlay drawer */
        @media (max-width: 767px) {
          .admin-main {
            margin-left: 0 !important;
          }
        }
        /* Hover effect for nav links */
        .admin-sidebar nav a:hover {
          background: rgba(255,255,255,0.06) !important;
          color: rgba(255,255,255,0.9) !important;
          transform: translateX(2px);
        }
        .admin-sidebar nav a:active {
          transform: translateX(0);
        }
      `}</style>
    </div>
  );
}

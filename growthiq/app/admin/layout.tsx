'use client';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const adminNav = [
  { href: '/admin',              icon: '🏠', label: 'Overview'      },
  { href: '/admin/users',        icon: '👥', label: 'Users'         },
  { href: '/admin/analytics',    icon: '📊', label: 'Analytics'     },
  { href: '/admin/reports',      icon: '📋', label: 'Reports'       },
  { href: '/admin/notifications',icon: '🔔', label: 'Notifications' },
  { href: '/admin/revenue',      icon: '💳', label: 'Revenue'       },
  { href: '/admin/ai-usage',     icon: '🤖', label: 'AI Usage'      },
  { href: '/admin/feedback',     icon: '💬', label: 'Feedback'      },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => { logout(); router.push('/auth/login'); };

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#0a0a0f', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid rgba(255,255,255,0.1)', borderTopColor: '#6366f1', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.875rem' }}>Verifying admin access...</p>
      </div>
    );
  }

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
      <aside style={{
        width: 240, flexShrink: 0, background: 'rgba(255,255,255,0.03)',
        borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex',
        flexDirection: 'column', position: 'fixed', top: 0, left: sidebarOpen ? 0 : -260,
        height: '100vh', zIndex: 200, transition: 'left 0.25s ease',
        backdropFilter: 'blur(20px)',
      }}
        className="admin-sidebar"
      >
        {/* Logo */}
        <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>⚡</div>
            <div>
              <div style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '0.95rem', color: '#fff' }}>GrowthIQ</div>
              <div style={{ fontSize: '0.65rem', color: '#ef4444', fontWeight: 700, letterSpacing: '0.1em' }}>ADMIN PANEL</div>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 10px', overflowY: 'auto' }}>
          {adminNav.map(n => (
            <Link
              key={n.href} href={n.href}
              onClick={() => setSidebarOpen(false)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '10px 12px', borderRadius: 10, marginBottom: 2,
                textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
                transition: 'all 0.15s ease',
                background: isActive(n.href) ? 'linear-gradient(135deg,rgba(99,102,241,0.2),rgba(139,92,246,0.1))' : 'transparent',
                color: isActive(n.href) ? '#818cf8' : 'rgba(255,255,255,0.55)',
                borderLeft: isActive(n.href) ? '2px solid #6366f1' : '2px solid transparent',
              }}
            >
              <span style={{ fontSize: '1rem', flexShrink: 0 }}>{n.icon}</span>
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>

        {/* Admin profile at bottom */}
        <div style={{ padding: '14px 14px 20px', borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#ef4444,#f97316)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
              {user.name?.[0] ?? 'A'}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</div>
              <div style={{ fontSize: '0.68rem', color: '#ef4444', fontWeight: 700 }}>Administrator</div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '8px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, color: '#ef4444', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}>
            🚪 Sign Out
          </button>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 199, backdropFilter: 'blur(2px)' }} />
      )}

      {/* ── Main content ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }} className="admin-main">

        {/* Topbar */}
        <header style={{
          height: 56, background: 'rgba(255,255,255,0.02)', borderBottom: '1px solid rgba(255,255,255,0.07)',
          display: 'flex', alignItems: 'center', padding: '0 20px', gap: 12,
          position: 'sticky', top: 0, zIndex: 100, backdropFilter: 'blur(20px)',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Hamburger */}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.6)', padding: 4, display: 'flex', flexDirection: 'column', gap: 4, flexShrink: 0 }}
              aria-label="Toggle sidebar"
            >
              <span style={{ display: 'block', width: 20, height: 2, background: 'currentColor', borderRadius: 2, transition: 'all 0.2s', transform: sidebarOpen ? 'rotate(45deg) translateY(6px)' : 'none' }} />
              <span style={{ display: 'block', width: 20, height: 2, background: 'currentColor', borderRadius: 2, opacity: sidebarOpen ? 0 : 1 }} />
              <span style={{ display: 'block', width: 20, height: 2, background: 'currentColor', borderRadius: 2, transition: 'all 0.2s', transform: sidebarOpen ? 'rotate(-45deg) translateY(-6px)' : 'none' }} />
            </button>
            <div>
              <span style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '0.95rem', color: '#fff' }}>
                {adminNav.find(n => isActive(n.href))?.label ?? 'Admin'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ padding: '3px 10px', background: 'rgba(239,68,68,0.12)', color: '#ef4444', borderRadius: 20, fontSize: '0.7rem', fontWeight: 700 }}>🛡️ ADMIN</span>
            <Link href="/dashboard" style={{ padding: '6px 12px', background: 'rgba(255,255,255,0.05)', color: 'rgba(255,255,255,0.6)', borderRadius: 8, textDecoration: 'none', fontSize: '0.78rem', border: '1px solid rgba(255,255,255,0.08)' }}>
              ← User View
            </Link>
          </div>
        </header>

        <main style={{ flex: 1, padding: '24px 20px', overflowY: 'auto', maxWidth: 1400, width: '100%', margin: '0 auto' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (min-width: 768px) {
          .admin-sidebar { left: 0 !important; }
          .admin-main { margin-left: 240px; }
        }
        @media (max-width: 767px) {
          .admin-main { margin-left: 0; }
        }
      `}</style>
    </div>
  );
}

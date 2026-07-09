'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Overview {
  total_users: number;
  total_businesses: number;
  total_reports: number;
  total_revenue_inr: number;
  avg_health_score: number;
}

interface Notification { title: string; subtitle: string; meta: string; created_at: string; }

const glass = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 16,
  backdropFilter: 'blur(20px)',
};

const kpiCards = [
  { key: 'total_users',       label: 'Total Users',       icon: '👥', color: '#6366f1' },
  { key: 'total_businesses',  label: 'Businesses',        icon: '🏢', color: '#10b981' },
  { key: 'total_reports',     label: 'AI Reports',        icon: '📋', color: '#8b5cf6' },
  { key: 'total_revenue_inr', label: 'Revenue (₹)',       icon: '💰', color: '#f59e0b', format: (v: number) => `₹${v.toLocaleString('en-IN')}` },
  { key: 'avg_health_score',  label: 'Avg Health Score',  icon: '🧠', color: '#06b6d4', format: (v: number) => `${v}/100` },
];

export default function AdminOverviewPage() {
  const { fetchWithAuth } = useAuth();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [ov, notifs] = await Promise.all([
          fetchWithAuth('/admin/overview'),
          fetchWithAuth('/admin/notifications'),
        ]);
        setOverview(ov);
        setNotifications(notifs.notifications || []);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const val = (k: string) => (overview as any)?.[k] ?? 0;

  return (
    <div style={{ color: '#e2e8f0' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(1.3rem,3vw,1.75rem)', fontWeight: 800, color: '#fff', marginBottom: 4 }}>
          🏠 Admin Overview
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: '0.875rem' }}>
          Real-time platform metrics and recent activity
        </p>
      </div>

      {/* KPI Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 16, marginBottom: 32 }}>
        {kpiCards.map(card => (
          <div key={card.key} style={{ ...glass, padding: '20px 22px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -20, right: -20, width: 80, height: 80, borderRadius: '50%', background: card.color, opacity: 0.06 }} />
            <div style={{ fontSize: '1.6rem', marginBottom: 10 }}>{card.icon}</div>
            {loading ? (
              <div style={{ height: 36, background: 'rgba(255,255,255,0.06)', borderRadius: 8, marginBottom: 6, animation: 'pulse 1.5s ease infinite' }} />
            ) : (
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: 'clamp(1.4rem,3vw,1.8rem)', fontWeight: 700, color: card.color, lineHeight: 1.1, marginBottom: 4 }}>
                {card.format ? card.format(val(card.key)) : val(card.key).toLocaleString()}
              </div>
            )}
            <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {card.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick nav cards */}
      <div style={{ marginBottom: 28 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 14 }}>Quick Access</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(160px,1fr))', gap: 12 }}>
          {[
            { href: '/admin/users',         icon: '👥', label: 'Manage Users',    color: '#6366f1' },
            { href: '/admin/analytics',     icon: '📊', label: 'View Analytics',  color: '#10b981' },
            { href: '/admin/reports',       icon: '📋', label: 'All Reports',     color: '#8b5cf6' },
            { href: '/admin/notifications', icon: '🔔', label: 'Notifications',   color: '#f59e0b' },
            { href: '/admin/revenue',       icon: '💳', label: 'Revenue',         color: '#06b6d4' },
            { href: '/admin/feedback',      icon: '💬', label: 'Feedback',        color: '#ec4899' },
          ].map(c => (
            <Link key={c.href} href={c.href} style={{
              ...glass, padding: '16px', textDecoration: 'none',
              display: 'flex', flexDirection: 'column', gap: 8,
              transition: 'all 0.2s ease', cursor: 'pointer',
            }}>
              <span style={{ fontSize: '1.4rem' }}>{c.icon}</span>
              <span style={{ fontSize: '0.82rem', color: c.color, fontWeight: 600 }}>{c.label} →</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent registrations */}
      <div style={{ ...glass, padding: 24 }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', marginBottom: 18 }}>🔔 Recent Registrations</h2>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[1,2,3].map(i => <div key={i} style={{ height: 44, background: 'rgba(255,255,255,0.04)', borderRadius: 10, animation: 'pulse 1.5s ease infinite' }} />)}
          </div>
        ) : notifications.length === 0 ? (
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.875rem', textAlign: 'center', padding: '20px 0' }}>No recent registrations.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {notifications.slice(0, 10).map((n, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                  {n.title.replace('New user registered: ', '')[0] ?? '?'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#e2e8f0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {n.title.replace('New user registered: ', '')}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'rgba(255,255,255,0.4)' }}>{n.subtitle}</div>
                </div>
                <span style={{ fontSize: '0.7rem', padding: '2px 8px', borderRadius: 20, background: 'rgba(99,102,241,0.15)', color: '#818cf8', flexShrink: 0, textTransform: 'capitalize' }}>
                  {n.meta}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.3)', flexShrink: 0 }}>
                  {n.created_at ? new Date(n.created_at).toLocaleDateString('en-IN') : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <style>{`
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>
    </div>
  );
}

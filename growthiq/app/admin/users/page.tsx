'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserItem {
  id: string;
  name: string;
  email: string;
  plan: string;
  role: string;
  is_active: boolean;
  created_at: string;
  // Computed or custom properties
  business?: string;
  industry?: string;
  score?: number;
  lastLogin?: string;
}

export default function AdminUsersPage() {
  const { fetchWithAuth, user } = useAuth();
  const [usersList, setUsersList] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState<UserItem | null>(null);

  useEffect(() => {
    const loadUsers = async () => {
      if (!user || user.role !== 'admin') {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchWithAuth('/admin/users');
        if (Array.isArray(data)) {
          // Map and populate optional fields for preview
          const enriched = data.map((u: any, idx: number) => ({
            ...u,
            business: u.business || 'GrowthIQ Partner',
            industry: u.industry || 'General SMB',
            score: u.score || (70 + (idx % 4) * 7),
            lastLogin: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A'
          }));
          setUsersList(enriched);
        }
      } catch (err) {
        console.error('Failed to load admin users:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      loadUsers();
    }
  }, [user]);

  const filtered = usersList.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || 
                          u.email.toLowerCase().includes(search.toLowerCase());
    if (statusFilter === 'All') return matchesSearch;
    if (statusFilter === 'Active') return matchesSearch && u.role !== 'admin';
    if (statusFilter === 'Admin') return matchesSearch && u.role === 'admin';
    return matchesSearch;
  });

  if (loading) {
    return (
      <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading Users Directory...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>User Management</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {usersList.length} total users · {usersList.filter(u => u.role === 'admin').length} administrators
        </p>
      </div>

      <div className="grid-4" style={{ marginBottom: 24 }}>
        {[
          ['👥', 'Total Users', usersList.length, 'primary'],
          ['🛡️', 'Admins', usersList.filter(u => u.role === 'admin').length, 'danger'],
          ['💳', 'Starter Plan', usersList.filter(u => u.plan === 'starter').length, 'warning'],
          ['🚀', 'Growth & Scale', usersList.filter(u => u.plan !== 'starter').length, 'success']
        ].map(([icon, label, val, color]) => (
          <div key={String(label)} className="admin-stat">
            <div style={{ fontSize: '1.5rem', marginBottom: 6 }}>{icon}</div>
            <div className="admin-kpi" style={{ color: `var(--accent-${color})` }}>{val}</div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 4 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
        <input className="input" style={{ maxWidth: 320 }} placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        {['All', 'Active', 'Admin'].map(s => (
          <button key={s} onClick={() => setStatusFilter(s)} className="btn btn-sm" style={{ background: statusFilter === s ? 'var(--accent-primary)' : 'var(--bg-elevated)', color: statusFilter === s ? '#fff' : 'var(--text-secondary)' }}>{s}</button>
        ))}
        <button className="btn btn-ghost btn-sm" style={{ marginLeft: 'auto' }}>📥 Export CSV</button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedUser ? '1fr 360px' : '1fr', gap: 20 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Plan</th>
                <th>Registered</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id} style={{ cursor: 'pointer', background: selectedUser?.id === u.id ? 'rgba(var(--accent-primary-rgb),0.04)' : '' }} onClick={() => setSelectedUser(u)}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.8rem' }}>{u.name[0]}</div>
                      <div>
                        <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{u.name}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`badge badge-${u.role === 'admin' ? 'danger' : 'muted'}`}>
                      {u.role.toUpperCase()}
                    </span>
                  </td>
                  <td>
                    <span className={`badge badge-${u.plan === 'scale' ? 'primary' : u.plan === 'growth' ? 'success' : 'muted'}`} style={{ textTransform: 'capitalize' }}>
                      {u.plan}
                    </span>
                  </td>
                  <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    {u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : 'N/A'}
                  </td>
                  <td>
                    <span className={`badge badge-${u.is_active !== false ? 'success' : 'danger'}`}>
                      {u.is_active !== false ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-ghost btn-sm" onClick={e => { e.stopPropagation(); setSelectedUser(u); }}>View →</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {selectedUser && (
          <div className="card p-5">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700 }}>User Details</h3>
              <button onClick={() => setSelectedUser(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '1.4rem', margin: '0 auto 10px' }}>{selectedUser.name[0]}</div>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>{selectedUser.name}</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{selectedUser.email}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
              {[
                ['Role', selectedUser.role.toUpperCase()],
                ['Plan', selectedUser.plan.toUpperCase()],
                ['Registered', selectedUser.created_at ? new Date(selectedUser.created_at).toLocaleDateString() : 'N/A'],
                ['Last Active', selectedUser.lastLogin || 'N/A']
              ].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{k}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn btn-primary btn-sm" style={{ width: '100%' }}>✉️ Send Email</button>
              <button className="btn btn-ghost btn-sm" style={{ width: '100%' }}>⬆️ Upgrade Plan</button>
              <button className="btn btn-ghost btn-sm" style={{ width: '100%', color: 'var(--accent-danger)' }}>🔒 Suspend Account</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

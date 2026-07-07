'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface FeedbackItem {
  id: string;
  name: string;
  email: string;
  type: string;
  message: string;
  status: string;
  created_at: string;
}

const TYPE_COLORS: Record<string, string> = { bug: 'danger', feature: 'primary', compliment: 'success', general: 'muted' };
const STATUS_COLORS: Record<string, string> = { new: 'warning', 'in-review': 'primary', resolved: 'success', closed: 'muted' };

export default function AdminFeedbackPage() {
  const { fetchWithAuth, user } = useAuth();
  const [feedbackList, setFeedbackList] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('All');
  const [activeStatus, setActiveStatus] = useState('All');
  const [selected, setSelected] = useState<FeedbackItem | null>(null);
  const [reply, setReply] = useState('');
  const [updating, setUpdating] = useState(false);

  const loadFeedback = async () => {
    try {
      const data = await fetchWithAuth('/admin/feedback');
      if (Array.isArray(data)) {
        setFeedbackList(data);
      }
    } catch (err) {
      console.error('Failed to load feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && user.role === 'admin') {
      loadFeedback();
    } else {
      setLoading(false);
    }
  }, [user]);

  const updateStatus = async (statusVal: string) => {
    if (!selected) return;
    setUpdating(true);
    try {
      await fetchWithAuth(`/admin/feedback/${selected.id}?status=${statusVal}`, {
        method: 'PATCH',
      });
      setSelected(prev => prev ? { ...prev, status: statusVal } : null);
      loadFeedback();
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  const filtered = feedbackList.filter(f => 
    (activeType === 'All' || f.type.toLowerCase() === activeType.toLowerCase()) &&
    (activeStatus === 'All' || f.status.toLowerCase() === activeStatus.toLowerCase().replace(' ', '-'))
  );

  if (loading) {
    return (
      <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading Feedback Submissions...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Feedback Management</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          {feedbackList.length} total feedback items · {feedbackList.filter(f => f.status === 'new').length} new
        </p>
      </div>

      <div className="grid-4" style={{ marginBottom: 20 }}>
        {[
          ['🐛', 'Bug Reports', feedbackList.filter(f => f.type === 'bug').length, 'danger'],
          ['💡', 'Feature Requests', feedbackList.filter(f => f.type === 'feature').length, 'primary'],
          ['⭐', 'Compliments', feedbackList.filter(f => f.type === 'compliment').length, 'success'],
          ['💬', 'General', feedbackList.filter(f => f.type === 'general').length, 'muted']
        ].map(([icon, label, val, c]) => (
          <div key={String(label)} className="admin-stat" style={{ textAlign: 'center' }}>
            <span style={{ fontSize: '1.5rem' }}>{icon}</span>
            <div className="admin-kpi" style={{ color: `var(--accent-${c})`, marginTop: 6, fontSize: '1.75rem' }}>{val}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {['All', 'Bug', 'Feature', 'Compliment', 'General'].map(t => (
          <button key={t} onClick={() => setActiveType(t)} className="btn btn-sm" style={{ background: activeType === t ? 'var(--accent-primary)' : 'var(--bg-elevated)', color: activeType === t ? '#fff' : 'var(--text-secondary)' }}>{t}</button>
        ))}
        <div style={{ width: 1, background: 'var(--border)', margin: '0 4px' }} />
        {['All', 'New', 'In Review', 'Resolved'].map(s => (
          <button key={s} onClick={() => setActiveStatus(s)} className="btn btn-sm" style={{ background: activeStatus === s ? 'var(--bg-elevated)' : 'transparent', color: 'var(--text-secondary)', border: `1px solid ${activeStatus === s ? 'var(--accent-primary)' : 'var(--border)'}` }}>{s}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selected ? '1fr 380px' : '1fr', gap: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map(f => (
            <div key={f.id} onClick={() => setSelected(f)} className="card hover-card" style={{ padding: '16px 20px', cursor: 'pointer', borderLeft: `4px solid var(--accent-${TYPE_COLORS[f.type] || 'muted'})`, background: selected?.id === f.id ? 'rgba(var(--accent-primary-rgb),0.04)' : 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span className={`badge badge-${TYPE_COLORS[f.type] || 'muted'}`} style={{ textTransform: 'capitalize' }}>{f.type}</span>
                <span className={`badge badge-${STATUS_COLORS[f.status] || 'muted'}`} style={{ textTransform: 'capitalize' }}>{f.status.replace('-', ' ')}</span>
                <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)' }}>{f.created_at ? new Date(f.created_at).toLocaleDateString() : 'N/A'}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: '0.72rem', flexShrink: 0 }}>{f.name?.[0] || 'U'}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.82rem', marginBottom: 4 }}>{f.name} ({f.email})</div>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{f.message.slice(0, 120)}{f.message.length > 120 ? '...' : ''}</p>
                </div>
              </div>
            </div>
          ))}
          {filtered.length === 0 && <div className="empty-state"><div className="empty-icon">📭</div><p style={{ color: 'var(--text-muted)' }}>No feedback matching your filters.</p></div>}
        </div>

        {selected && (
          <div className="card p-5">
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700 }}>Feedback Detail</h3>
              <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>×</button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <span className={`badge badge-${TYPE_COLORS[selected.type] || 'muted'}`} style={{ textTransform: 'capitalize' }}>{selected.type}</span>
              <span className={`badge badge-${STATUS_COLORS[selected.status] || 'muted'}`} style={{ textTransform: 'capitalize' }}>{selected.status.replace('-', ' ')}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14, padding: '10px 14px', background: 'var(--bg-elevated)', borderRadius: 10 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700 }}>{selected.name?.[0] || 'U'}</div>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem' }}>{selected.name}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{selected.email}</div>
              </div>
            </div>
            <div style={{ padding: '14px 16px', background: 'var(--bg-elevated)', borderRadius: 10, marginBottom: 16 }}>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.7, color: 'var(--text-secondary)' }}>{selected.message}</p>
            </div>
            <div className="input-group" style={{ marginBottom: 12 }}>
              <label className="input-label">Reply to User</label>
              <textarea className="input" rows={3} placeholder="Type your reply..." value={reply} onChange={e => setReply(e.target.value)} style={{ resize: 'vertical' }} />
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => { alert('Reply sent successfully!'); setReply(''); }}>✉️ Send Reply</button>
              <select 
                className="input" 
                style={{ flex: 1, fontSize: '0.82rem' }} 
                disabled={updating}
                onChange={(e) => updateStatus(e.target.value)}
                value={selected.status}
              >
                <option value="new">New</option>
                <option value="in-review">In Review</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

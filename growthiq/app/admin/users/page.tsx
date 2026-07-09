'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface UserRow {
  id: string; name: string; email: string;
  plan: string; role: string; is_active?: boolean;
  created_at: string;
  business_name: string; industry: string; city: string; state: string;
}

interface UserDetail {
  user: any; business: any; analyses: any[];
  total_reports: number; latest_score: number | null;
}

const glass = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, backdropFilter:'blur(20px)' };
const col = { color:'rgba(255,255,255,0.5)', fontSize:'0.75rem', textTransform:'uppercase' as const, letterSpacing:'0.05em', padding:'10px 14px', textAlign:'left' as const, borderBottom:'1px solid rgba(255,255,255,0.06)', whiteSpace:'nowrap' as const };

function Toast({ msg, type, onClose }: { msg:string, type:'success'|'error', onClose:()=>void }) {
  useEffect(() => { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); }, []);
  return (
    <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, padding:'12px 20px', borderRadius:12,
      background: type === 'success' ? 'rgba(16,185,129,0.9)' : 'rgba(239,68,68,0.9)',
      color:'#fff', fontWeight:600, fontSize:'0.875rem', backdropFilter:'blur(10px)',
      boxShadow:'0 8px 32px rgba(0,0,0,0.4)', display:'flex', alignItems:'center', gap:8 }}>
      {type === 'success' ? '✅' : '❌'} {msg}
    </div>
  );
}

function ConfirmDialog({ message, onConfirm, onCancel }: { message:string, onConfirm:()=>void, onCancel:()=>void }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', zIndex:9998, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div style={{ ...glass, padding:32, maxWidth:420, width:'100%', textAlign:'center' }}>
        <div style={{ fontSize:'2.5rem', marginBottom:12 }}>⚠️</div>
        <p style={{ color:'#e2e8f0', marginBottom:24, lineHeight:1.6 }}>{message}</p>
        <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
          <button onClick={onCancel} style={{ padding:'10px 20px', background:'rgba(255,255,255,0.08)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:10, color:'#e2e8f0', cursor:'pointer', fontWeight:600 }}>Cancel</button>
          <button onClick={onConfirm} style={{ padding:'10px 20px', background:'#ef4444', border:'none', borderRadius:10, color:'#fff', cursor:'pointer', fontWeight:600 }}>Confirm</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminUsersPage() {
  const { fetchWithAuth } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState<string|null>(null);
  const [detail, setDetail] = useState<UserDetail|null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [editPlan, setEditPlan] = useState('');
  const [confirm, setConfirm] = useState<{msg:string,action:()=>void}|null>(null);
  const [toast, setToast] = useState<{msg:string,type:'success'|'error'}|null>(null);

  const PER_PAGE = 20;

  const showToast = (msg: string, type: 'success'|'error' = 'success') => {
    setToast({ msg, type });
  };

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page), per_page: String(PER_PAGE),
        ...(search ? { search } : {}),
        ...(roleFilter !== 'all' ? { role: roleFilter } : {}),
        ...(planFilter !== 'all' ? { plan: planFilter } : {}),
      });
      const data = await fetchWithAuth(`/admin/users?${params}`);
      let list: UserRow[] = data.users || [];
      if (sortBy === 'oldest') list = [...list].reverse();
      if (sortBy === 'name') list = [...list].sort((a,b) => a.name.localeCompare(b.name));
      setUsers(list);
      setTotal(data.total || 0);
    } catch(e) { showToast('Failed to load users', 'error'); }
    finally { setLoading(false); }
  }, [search, roleFilter, planFilter, sortBy, page]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const loadDetail = async (id: string) => {
    setSelectedId(id);
    setDetail(null);
    setDetailLoading(true);
    try {
      const d = await fetchWithAuth(`/admin/users/${id}`);
      setDetail(d);
      setEditPlan(d.user?.plan || 'starter');
    } catch(e) { showToast('Failed to load user detail', 'error'); }
    finally { setDetailLoading(false); }
  };

  const updateUser = async (id: string, payload: any, successMsg: string) => {
    try {
      await fetchWithAuth(`/admin/users/${id}`, { method:'PATCH', body: JSON.stringify(payload) });
      showToast(successMsg);
      loadUsers();
      if (selectedId === id) loadDetail(id);
    } catch(e:any) { showToast(e?.message || 'Update failed', 'error'); }
  };

  const deleteUser = async (id: string) => {
    try {
      await fetchWithAuth(`/admin/users/${id}`, { method:'DELETE' });
      showToast('User deleted successfully');
      setSelectedId(null); setDetail(null);
      loadUsers();
    } catch(e:any) { showToast(e?.message || 'Delete failed', 'error'); }
  };

  const planBadge = (plan: string) => {
    const colors: Record<string,string> = { scale:'#6366f1', growth:'#10b981', starter:'rgba(255,255,255,0.2)' };
    return <span style={{ fontSize:'0.7rem', padding:'2px 8px', borderRadius:20, background: colors[plan] || 'rgba(255,255,255,0.1)', color:'#fff', textTransform:'capitalize', fontWeight:600 }}>{plan}</span>;
  };

  const roleBadge = (role: string) => (
    <span style={{ fontSize:'0.7rem', padding:'2px 8px', borderRadius:20, background: role==='admin' ? 'rgba(239,68,68,0.2)' : 'rgba(255,255,255,0.07)', color: role==='admin' ? '#ef4444' : 'rgba(255,255,255,0.5)', fontWeight:700, textTransform:'uppercase' }}>{role}</span>
  );

  const totalPages = Math.ceil(total / PER_PAGE);

  return (
    <div style={{ color:'#e2e8f0' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      {confirm && <ConfirmDialog message={confirm.msg} onConfirm={() => { confirm.action(); setConfirm(null); }} onCancel={() => setConfirm(null)} />}

      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:24, flexWrap:'wrap', gap:12 }}>
        <div>
          <h1 style={{ fontFamily:'Outfit', fontSize:'clamp(1.3rem,3vw,1.75rem)', fontWeight:800, color:'#fff', marginBottom:4 }}>👥 User Management</h1>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.875rem' }}>{total} users registered</p>
        </div>
      </div>

      {/* Filters */}
      <div style={{ ...glass, padding:'14px 16px', marginBottom:20, display:'flex', gap:10, flexWrap:'wrap', alignItems:'center' }}>
        <input
          style={{ flex:1, minWidth:200, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'8px 12px', color:'#e2e8f0', fontSize:'0.875rem', outline:'none' }}
          placeholder="🔍 Search name or email..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
        {[
          { label:'Role', value:roleFilter, setter:setRoleFilter, opts:[['all','All Roles'],['user','Users'],['admin','Admins']] },
          { label:'Plan', value:planFilter, setter:setPlanFilter, opts:[['all','All Plans'],['starter','Starter'],['growth','Growth'],['scale','Scale']] },
          { label:'Sort', value:sortBy,     setter:setSortBy,     opts:[['newest','Newest'],['oldest','Oldest'],['name','Name A-Z'],['activity','Activity']] },
        ].map(({ label, value, setter, opts }) => (
          <select key={label} value={value} onChange={e => { setter(e.target.value); setPage(1); }}
            style={{ background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'8px 10px', color:'#e2e8f0', fontSize:'0.8rem', cursor:'pointer' }}>
            {opts.map(([v,l]) => <option key={v} value={v} style={{ background:'#1a1a2e' }}>{l}</option>)}
          </select>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns: selectedId ? 'minmax(0,1fr) 360px' : '1fr', gap:20 }}>

        {/* Table */}
        <div style={{ ...glass, overflow:'hidden' }}>
          <div style={{ overflowX:'auto' }}>
            <table style={{ width:'100%', borderCollapse:'collapse', minWidth:640 }}>
              <thead>
                <tr>
                  {['User','Business','Industry','City','Plan','Role','Registered','Status','Actions'].map(h => (
                    <th key={h} style={col}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [...Array(6)].map((_,i) => (
                    <tr key={i}>
                      {[...Array(9)].map((_,j) => (
                        <td key={j} style={{ padding:'12px 14px' }}>
                          <div style={{ height:16, background:'rgba(255,255,255,0.05)', borderRadius:4, animation:'pulse 1.5s ease infinite' }} />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : users.length === 0 ? (
                  <tr><td colSpan={9} style={{ textAlign:'center', padding:40, color:'rgba(255,255,255,0.3)', fontSize:'0.875rem' }}>No users found</td></tr>
                ) : users.map(u => (
                  <tr key={u.id} onClick={() => loadDetail(u.id)}
                    style={{ cursor:'pointer', borderBottom:'1px solid rgba(255,255,255,0.04)', background: selectedId===u.id ? 'rgba(99,102,241,0.08)' : 'transparent', transition:'background 0.15s' }}>
                    <td style={{ padding:'11px 14px', whiteSpace:'nowrap' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                        <div style={{ width:30, height:30, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:'0.75rem', flexShrink:0 }}>{u.name[0]}</div>
                        <div>
                          <div style={{ fontWeight:600, fontSize:'0.82rem', color:'#e2e8f0' }}>{u.name}</div>
                          <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.35)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding:'11px 14px', fontSize:'0.8rem', color:'rgba(255,255,255,0.65)', whiteSpace:'nowrap', maxWidth:140, overflow:'hidden', textOverflow:'ellipsis' }}>{u.business_name}</td>
                    <td style={{ padding:'11px 14px', fontSize:'0.78rem', color:'rgba(255,255,255,0.5)', whiteSpace:'nowrap' }}>{u.industry}</td>
                    <td style={{ padding:'11px 14px', fontSize:'0.78rem', color:'rgba(255,255,255,0.4)', whiteSpace:'nowrap' }}>{u.city}</td>
                    <td style={{ padding:'11px 14px' }}>{planBadge(u.plan)}</td>
                    <td style={{ padding:'11px 14px' }}>{roleBadge(u.role)}</td>
                    <td style={{ padding:'11px 14px', fontSize:'0.78rem', color:'rgba(255,255,255,0.4)', whiteSpace:'nowrap' }}>{u.created_at ? new Date(u.created_at).toLocaleDateString('en-IN') : 'N/A'}</td>
                    <td style={{ padding:'11px 14px' }}>
                      <span style={{ fontSize:'0.7rem', padding:'2px 8px', borderRadius:20, background: u.is_active !== false ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: u.is_active !== false ? '#10b981' : '#ef4444', fontWeight:600 }}>
                        {u.is_active !== false ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                    <td style={{ padding:'11px 14px' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display:'flex', gap:4 }}>
                        <button onClick={() => loadDetail(u.id)} style={{ padding:'4px 8px', background:'rgba(99,102,241,0.15)', border:'1px solid rgba(99,102,241,0.3)', borderRadius:6, color:'#818cf8', fontSize:'0.72rem', cursor:'pointer' }}>View</button>
                        <button onClick={() => setConfirm({ msg:`Delete user "${u.name}"? This removes all their data permanently.`, action:()=>deleteUser(u.id) })}
                          style={{ padding:'4px 8px', background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:6, color:'#ef4444', fontSize:'0.72rem', cursor:'pointer' }}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display:'flex', justifyContent:'center', alignItems:'center', gap:8, padding:'14px 16px', borderTop:'1px solid rgba(255,255,255,0.06)' }}>
              <button disabled={page===1} onClick={() => setPage(p=>p-1)} style={{ padding:'6px 12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color: page===1 ? 'rgba(255,255,255,0.2)' : '#e2e8f0', cursor: page===1?'not-allowed':'pointer', fontSize:'0.8rem' }}>← Prev</button>
              <span style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.8rem' }}>Page {page} of {totalPages}</span>
              <button disabled={page===totalPages} onClick={() => setPage(p=>p+1)} style={{ padding:'6px 12px', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, color: page===totalPages ? 'rgba(255,255,255,0.2)' : '#e2e8f0', cursor: page===totalPages?'not-allowed':'pointer', fontSize:'0.8rem' }}>Next →</button>
            </div>
          )}
        </div>

        {/* Detail Panel */}
        {selectedId && (
          <div style={{ ...glass, padding:22, height:'fit-content', position:'sticky', top:80 }}>
            <div style={{ display:'flex', justifyContent:'space-between', marginBottom:18 }}>
              <h3 style={{ fontWeight:700, color:'#fff', fontSize:'0.95rem' }}>User Profile</h3>
              <button onClick={() => { setSelectedId(null); setDetail(null); }} style={{ background:'none', border:'none', color:'rgba(255,255,255,0.4)', cursor:'pointer', fontSize:'1.2rem' }}>×</button>
            </div>

            {detailLoading ? (
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {[...Array(5)].map((_,i) => <div key={i} style={{ height:20, background:'rgba(255,255,255,0.05)', borderRadius:6, animation:'pulse 1.5s ease infinite' }} />)}
              </div>
            ) : detail && (
              <>
                {/* Avatar */}
                <div style={{ textAlign:'center', marginBottom:20 }}>
                  <div style={{ width:52, height:52, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:'1.3rem', margin:'0 auto 10px' }}>{detail.user?.name?.[0]}</div>
                  <div style={{ fontWeight:700, color:'#fff', fontSize:'0.95rem' }}>{detail.user?.name}</div>
                  <div style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.4)' }}>{detail.user?.email}</div>
                  <div style={{ display:'flex', gap:6, justifyContent:'center', marginTop:8 }}>
                    {planBadge(detail.user?.plan)} {roleBadge(detail.user?.role)}
                  </div>
                </div>

                {/* Info rows */}
                {[
                  ['Business', detail.business?.business_name || '—'],
                  ['Industry', detail.business?.industry || '—'],
                  ['Location', `${detail.business?.city || '—'}, ${detail.business?.state || '—'}`],
                  ['Revenue', detail.business?.monthly_revenue ? `₹${Number(detail.business.monthly_revenue).toLocaleString('en-IN')}` : '—'],
                  ['Customers', detail.business?.monthly_customers || '—'],
                  ['Reports', detail.total_reports],
                  ['Health Score', detail.latest_score !== null ? `${detail.latest_score}/100` : 'No reports yet'],
                  ['Registered', detail.user?.created_at ? new Date(detail.user.created_at).toLocaleDateString('en-IN') : '—'],
                ].map(([k,v]) => (
                  <div key={String(k)} style={{ display:'flex', justifyContent:'space-between', padding:'7px 0', borderBottom:'1px solid rgba(255,255,255,0.05)', gap:10 }}>
                    <span style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.4)' }}>{k}</span>
                    <span style={{ fontSize:'0.8rem', fontWeight:500, color:'#e2e8f0', textAlign:'right' }}>{String(v)}</span>
                  </div>
                ))}

                {/* Actions */}
                <div style={{ display:'flex', flexDirection:'column', gap:8, marginTop:18 }}>
                  {/* Change plan */}
                  <div style={{ display:'flex', gap:8 }}>
                    <select value={editPlan} onChange={e => setEditPlan(e.target.value)}
                      style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'8px', color:'#e2e8f0', fontSize:'0.8rem' }}>
                      <option value="starter" style={{ background:'#1a1a2e' }}>Starter</option>
                      <option value="growth" style={{ background:'#1a1a2e' }}>Growth</option>
                      <option value="scale" style={{ background:'#1a1a2e' }}>Scale</option>
                    </select>
                    <button onClick={() => updateUser(detail.user.id, { plan: editPlan }, 'Plan updated!')}
                      style={{ padding:'8px 14px', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', border:'none', borderRadius:8, color:'#fff', fontSize:'0.8rem', fontWeight:600, cursor:'pointer' }}>
                      Save
                    </button>
                  </div>

                  {/* Suspend / Activate */}
                  <button onClick={() => updateUser(detail.user.id, { is_active: detail.user?.is_active === false }, detail.user?.is_active === false ? 'User activated!' : 'User suspended!')}
                    style={{ padding:'8px', background: detail.user?.is_active === false ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)', border:`1px solid ${detail.user?.is_active === false ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, borderRadius:8, color: detail.user?.is_active === false ? '#10b981' : '#ef4444', fontSize:'0.8rem', fontWeight:600, cursor:'pointer' }}>
                    {detail.user?.is_active === false ? '✅ Activate User' : '🔒 Suspend User'}
                  </button>

                  {/* Promote to admin */}
                  {detail.user?.role !== 'admin' && (
                    <button onClick={() => setConfirm({ msg:`Promote "${detail.user?.name}" to admin?`, action:()=>updateUser(detail.user.id, { role:'admin' }, 'User promoted to admin!') })}
                      style={{ padding:'8px', background:'rgba(245,158,11,0.1)', border:'1px solid rgba(245,158,11,0.3)', borderRadius:8, color:'#f59e0b', fontSize:'0.8rem', fontWeight:600, cursor:'pointer' }}>
                      ⭐ Promote to Admin
                    </button>
                  )}

                  {/* Delete */}
                  <button onClick={() => setConfirm({ msg:`Permanently delete "${detail.user?.name}"? This cannot be undone.`, action:()=>deleteUser(detail.user.id) })}
                    style={{ padding:'8px', background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:8, color:'#ef4444', fontSize:'0.8rem', fontWeight:600, cursor:'pointer' }}>
                    🗑️ Delete User
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

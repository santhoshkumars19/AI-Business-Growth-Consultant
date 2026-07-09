'use client';
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Report { id:string; user_id:string; user_name:string; user_email:string; health_score:number; summary?:string; created_at:string; }

const glass = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, backdropFilter:'blur(20px)' };

function Toast({ msg, type, onClose }:{msg:string,type:'success'|'error',onClose:()=>void}) {
  useEffect(()=>{ const t=setTimeout(onClose,3000); return ()=>clearTimeout(t); },[]);
  return <div style={{ position:'fixed', bottom:24, right:24, zIndex:9999, padding:'12px 20px', borderRadius:12, background:type==='success'?'rgba(16,185,129,0.9)':'rgba(239,68,68,0.9)', color:'#fff', fontWeight:600, fontSize:'0.875rem', backdropFilter:'blur(10px)', boxShadow:'0 8px 32px rgba(0,0,0,0.4)' }}>{type==='success'?'✅':'❌'} {msg}</div>;
}

function ConfirmDialog({message,onConfirm,onCancel}:{message:string,onConfirm:()=>void,onCancel:()=>void}) {
  return (
    <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.7)',zIndex:9998,display:'flex',alignItems:'center',justifyContent:'center',padding:20}}>
      <div style={{...glass,padding:32,maxWidth:420,width:'100%',textAlign:'center'}}>
        <div style={{fontSize:'2.5rem',marginBottom:12}}>⚠️</div>
        <p style={{color:'#e2e8f0',marginBottom:24,lineHeight:1.6}}>{message}</p>
        <div style={{display:'flex',gap:10,justifyContent:'center'}}>
          <button onClick={onCancel} style={{padding:'10px 20px',background:'rgba(255,255,255,0.08)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:10,color:'#e2e8f0',cursor:'pointer',fontWeight:600}}>Cancel</button>
          <button onClick={onConfirm} style={{padding:'10px 20px',background:'#ef4444',border:'none',borderRadius:10,color:'#fff',cursor:'pointer',fontWeight:600}}>Delete</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminReportsPage() {
  const { fetchWithAuth } = useAuth();
  const [reports, setReports] = useState<Report[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string|null>(null);
  const [confirm, setConfirm] = useState<{msg:string,action:()=>void}|null>(null);
  const [toast, setToast] = useState<{msg:string,type:'success'|'error'}|null>(null);
  const PER_PAGE = 20;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page:String(page), per_page:String(PER_PAGE), ...(search?{search}:{}) });
      const d = await fetchWithAuth(`/admin/reports?${params}`);
      setReports(d.reports || []);
      setTotal(d.total || 0);
    } catch(e) { setToast({msg:'Failed to load reports',type:'error'}); }
    finally { setLoading(false); }
  }, [search, page]);

  useEffect(() => { load(); }, [load]);

  const deleteReport = async (id: string) => {
    try {
      await fetchWithAuth(`/admin/reports/${id}`, { method:'DELETE' });
      setToast({msg:'Report deleted',type:'success'});
      load();
    } catch(e:any) { setToast({msg:e?.message||'Delete failed',type:'error'}); }
  };

  const scoreColor = (s:number) => s >= 70 ? '#10b981' : s >= 40 ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ color:'#e2e8f0' }}>
      {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)} />}
      {confirm && <ConfirmDialog message={confirm.msg} onConfirm={()=>{confirm.action();setConfirm(null);}} onCancel={()=>setConfirm(null)} />}

      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontFamily:'Outfit', fontSize:'clamp(1.3rem,3vw,1.75rem)', fontWeight:800, color:'#fff', marginBottom:4 }}>📋 Reports Management</h1>
        <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.875rem' }}>{total} AI reports generated across all users</p>
      </div>

      {/* Search */}
      <div style={{ ...glass, padding:'12px 16px', marginBottom:20, display:'flex', gap:12, alignItems:'center' }}>
        <input
          style={{ flex:1, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:8, padding:'8px 12px', color:'#e2e8f0', fontSize:'0.875rem', outline:'none' }}
          placeholder="🔍 Search by user name or email..." value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      {/* Table */}
      <div style={{ ...glass, overflow:'hidden' }}>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:540 }}>
            <thead>
              <tr>
                {['User','Email','Health Score','Summary','Generated','Actions'].map(h => (
                  <th key={h} style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.05em', padding:'10px 14px', textAlign:'left', borderBottom:'1px solid rgba(255,255,255,0.06)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(6)].map((_,i)=>(
                <tr key={i}>{[...Array(6)].map((_,j)=>(
                  <td key={j} style={{padding:'12px 14px'}}><div style={{height:16,background:'rgba(255,255,255,0.05)',borderRadius:4,animation:'pulse 1.5s ease infinite'}}/></td>
                ))}</tr>
              )) : reports.length===0 ? (
                <tr><td colSpan={6} style={{textAlign:'center',padding:40,color:'rgba(255,255,255,0.3)',fontSize:'0.875rem'}}>No reports found</td></tr>
              ) : reports.map(r => (
                <>
                  <tr key={r.id} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)', cursor:'pointer', background: expanded===r.id ? 'rgba(99,102,241,0.06)' : 'transparent' }}
                    onClick={()=>setExpanded(expanded===r.id?null:r.id)}>
                    <td style={{padding:'11px 14px'}}>
                      <div style={{display:'flex',alignItems:'center',gap:8}}>
                        <div style={{width:28,height:28,borderRadius:'50%',background:'linear-gradient(135deg,#6366f1,#8b5cf6)',display:'flex',alignItems:'center',justifyContent:'center',color:'#fff',fontWeight:700,fontSize:'0.72rem',flexShrink:0}}>{r.user_name[0]}</div>
                        <span style={{fontSize:'0.82rem',fontWeight:600,color:'#e2e8f0',whiteSpace:'nowrap'}}>{r.user_name}</span>
                      </div>
                    </td>
                    <td style={{padding:'11px 14px',fontSize:'0.78rem',color:'rgba(255,255,255,0.4)',whiteSpace:'nowrap'}}>{r.user_email}</td>
                    <td style={{padding:'11px 14px'}}>
                      <span style={{fontFamily:'JetBrains Mono',fontSize:'0.85rem',fontWeight:700,color:scoreColor(r.health_score)}}>{r.health_score}<span style={{fontSize:'0.7rem',color:'rgba(255,255,255,0.3)'}}>/100</span></span>
                    </td>
                    <td style={{padding:'11px 14px',fontSize:'0.78rem',color:'rgba(255,255,255,0.5)',maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{r.summary||'—'}</td>
                    <td style={{padding:'11px 14px',fontSize:'0.75rem',color:'rgba(255,255,255,0.4)',whiteSpace:'nowrap'}}>{r.created_at?new Date(r.created_at).toLocaleDateString('en-IN'):'-'}</td>
                    <td style={{padding:'11px 14px'}} onClick={e=>e.stopPropagation()}>
                      <button onClick={()=>setConfirm({msg:`Delete report by "${r.user_name}"?`,action:()=>deleteReport(r.id)})}
                        style={{padding:'4px 10px',background:'rgba(239,68,68,0.1)',border:'1px solid rgba(239,68,68,0.2)',borderRadius:6,color:'#ef4444',fontSize:'0.72rem',cursor:'pointer'}}>Delete</button>
                    </td>
                  </tr>
                  {expanded===r.id && (
                    <tr key={`${r.id}-exp`}><td colSpan={6} style={{padding:'0 14px 14px'}}>
                      <div style={{background:'rgba(255,255,255,0.03)',borderRadius:10,padding:16,fontSize:'0.8rem',color:'rgba(255,255,255,0.6)',lineHeight:1.7}}>
                        <strong style={{color:'#fff'}}>Summary:</strong> {r.summary||'No summary available for this report.'}<br/>
                        <span style={{color:'rgba(255,255,255,0.35)',fontSize:'0.72rem'}}>Report ID: {r.id}</span>
                      </div>
                    </td></tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {Math.ceil(total/PER_PAGE) > 1 && (
          <div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:8,padding:'14px 16px',borderTop:'1px solid rgba(255,255,255,0.06)'}}>
            <button disabled={page===1} onClick={()=>setPage(p=>p-1)} style={{padding:'6px 12px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:page===1?'rgba(255,255,255,0.2)':'#e2e8f0',cursor:page===1?'not-allowed':'pointer',fontSize:'0.8rem'}}>← Prev</button>
            <span style={{color:'rgba(255,255,255,0.5)',fontSize:'0.8rem'}}>Page {page} of {Math.ceil(total/PER_PAGE)}</span>
            <button disabled={page===Math.ceil(total/PER_PAGE)} onClick={()=>setPage(p=>p+1)} style={{padding:'6px 12px',background:'rgba(255,255,255,0.06)',border:'1px solid rgba(255,255,255,0.1)',borderRadius:8,color:page===Math.ceil(total/PER_PAGE)?'rgba(255,255,255,0.2)':'#e2e8f0',cursor:page===Math.ceil(total/PER_PAGE)?'not-allowed':'pointer',fontSize:'0.8rem'}}>Next →</button>
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

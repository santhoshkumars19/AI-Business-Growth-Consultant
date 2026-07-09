'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface Notif { type:string; title:string; subtitle:string; meta:string; created_at:string; }

const glass = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, backdropFilter:'blur(20px)' };

export default function AdminNotificationsPage() {
  const { fetchWithAuth } = useAuth();
  const [notifs, setNotifs] = useState<Notif[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('/admin/notifications')
      .then(d => setNotifs(d.notifications || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const planColor = (plan: string) => ({ scale:'#6366f1', growth:'#10b981', starter:'rgba(255,255,255,0.3)' }[plan] || 'rgba(255,255,255,0.3)');

  return (
    <div style={{ color:'#e2e8f0' }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'Outfit', fontSize:'clamp(1.3rem,3vw,1.75rem)', fontWeight:800, color:'#fff', marginBottom:4 }}>🔔 Notifications</h1>
        <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.875rem' }}>Recent user registrations and system activity</p>
      </div>

      {/* Summary cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, marginBottom:28 }}>
        {[
          { icon:'👥', label:'New Registrations', value:notifs.filter(n=>n.type==='registration').length, color:'#6366f1' },
          { icon:'🟢', label:'System Status', value:'Healthy', color:'#10b981' },
          { icon:'🔔', label:'Total Alerts', value:notifs.length, color:'#f59e0b' },
        ].map(k => (
          <div key={k.label} style={{ ...glass, padding:'18px 20px' }}>
            <div style={{ fontSize:'1.4rem', marginBottom:8 }}>{k.icon}</div>
            <div style={{ fontFamily:'JetBrains Mono', fontSize:'1.5rem', fontWeight:700, color:k.color, marginBottom:4 }}>
              {loading ? '—' : k.value}
            </div>
            <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* System Status */}
      <div style={{ ...glass, padding:24, marginBottom:20 }}>
        <h2 style={{ fontSize:'0.9rem', fontWeight:700, color:'#fff', marginBottom:16 }}>⚙️ System Status</h2>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(200px,1fr))', gap:12 }}>
          {[
            { label:'API Server',     status:'Operational', color:'#10b981' },
            { label:'Database',       status:'Operational', color:'#10b981' },
            { label:'Auth Service',   status:'Operational', color:'#10b981' },
            { label:'AI Engine',      status:'Operational', color:'#10b981' },
            { label:'Payment Gateway',status:'Operational', color:'#10b981' },
            { label:'Email Service',  status:'Operational', color:'#10b981' },
          ].map(s => (
            <div key={s.label} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 14px', background:'rgba(255,255,255,0.03)', borderRadius:10, border:'1px solid rgba(255,255,255,0.05)' }}>
              <span style={{ fontSize:'0.82rem', color:'rgba(255,255,255,0.65)' }}>{s.label}</span>
              <span style={{ display:'flex', alignItems:'center', gap:5, fontSize:'0.75rem', color:s.color, fontWeight:600 }}>
                <span style={{ width:6, height:6, borderRadius:'50%', background:s.color, display:'inline-block' }} />
                {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div style={{ ...glass, padding:24 }}>
        <h2 style={{ fontSize:'0.9rem', fontWeight:700, color:'#fff', marginBottom:18 }}>📋 Recent Registrations</h2>

        {loading ? (
          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
            {[1,2,3,4,5].map(i=><div key={i} style={{height:52,background:'rgba(255,255,255,0.04)',borderRadius:10,animation:'pulse 1.5s ease infinite'}} />)}
          </div>
        ) : notifs.length === 0 ? (
          <div style={{ textAlign:'center', padding:'40px 0', color:'rgba(255,255,255,0.3)', fontSize:'0.875rem' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:10 }}>📭</div>
            No recent activity to show.
          </div>
        ) : (
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {notifs.map((n,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', background:'rgba(255,255,255,0.03)', borderRadius:12, border:'1px solid rgba(255,255,255,0.05)' }}>
                <div style={{ width:38, height:38, borderRadius:'50%', background:'linear-gradient(135deg,#6366f1,#8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', color:'#fff', fontWeight:700, fontSize:'0.9rem', flexShrink:0 }}>
                  {n.title.replace('New user registered: ','')[0] || '?'}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontSize:'0.85rem', fontWeight:600, color:'#e2e8f0', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    {n.title}
                  </div>
                  <div style={{ fontSize:'0.75rem', color:'rgba(255,255,255,0.4)', marginTop:2 }}>{n.subtitle}</div>
                </div>
                <span style={{ fontSize:'0.7rem', padding:'3px 10px', borderRadius:20, background:`rgba(${n.meta==='scale'?'99,102,241':n.meta==='growth'?'16,185,129':'255,255,255'},0.12)`, color: planColor(n.meta), fontWeight:600, flexShrink:0, textTransform:'capitalize' }}>
                  {n.meta}
                </span>
                <span style={{ fontSize:'0.7rem', color:'rgba(255,255,255,0.3)', flexShrink:0, whiteSpace:'nowrap' }}>
                  {n.created_at ? new Date(n.created_at).toLocaleDateString('en-IN', { day:'numeric', month:'short' }) : ''}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

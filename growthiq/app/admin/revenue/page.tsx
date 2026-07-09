'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const glass = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, backdropFilter:'blur(20px)' };

export default function AdminRevenuePage() {
  const { fetchWithAuth } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('/admin/revenue')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const payments: any[] = data?.payments || [];
  const monthlyRev = data?.monthly_revenue || {};
  const monthLabels = Object.keys(monthlyRev).map(m => {
    const [y,mo] = m.split('-');
    return `${['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(mo)]} ${y.slice(2)}`;
  });
  const monthValues = Object.values(monthlyRev) as number[];

  const revenueChart = {
    labels: monthLabels,
    datasets: [{ label:'Revenue (₹)', data: monthValues, backgroundColor:'rgba(99,102,241,0.7)', borderRadius:6, hoverBackgroundColor:'#6366f1' }],
  };

  const chartOpts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:false}, tooltip:{ backgroundColor:'rgba(10,10,15,0.95)', titleColor:'#fff', bodyColor:'rgba(255,255,255,0.7)', callbacks:{ label:(ctx:any)=>`₹${Number(ctx.raw).toLocaleString('en-IN')}` } } },
    scales:{ x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'rgba(255,255,255,0.4)',font:{size:11}}}, y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'rgba(255,255,255,0.4)',font:{size:11},callback:(v:any)=>`₹${(v/1000).toFixed(0)}K`},border:{display:false}} },
  };

  const statusColor = (s:string) => s==='success' ? '#10b981' : s==='pending' ? '#f59e0b' : '#ef4444';

  return (
    <div style={{ color:'#e2e8f0' }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'Outfit', fontSize:'clamp(1.3rem,3vw,1.75rem)', fontWeight:800, color:'#fff', marginBottom:4 }}>💳 Revenue</h1>
        <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.875rem' }}>Payment transactions and revenue analytics</p>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:14, marginBottom:28 }}>
        {[
          { icon:'💰', label:'Total Revenue', value: data ? `₹${Number(data.total_revenue_inr).toLocaleString('en-IN')}` : '—', color:'#10b981' },
          { icon:'📅', label:'Monthly Revenue (MRR)', value: data ? `₹${Number(data.mrr).toLocaleString('en-IN')}` : '—', color:'#6366f1' },
          { icon:'📋', label:'Total Transactions', value: payments.length, color:'#8b5cf6' },
          { icon:'✅', label:'Successful', value: payments.filter(p=>p.status==='success').length, color:'#10b981' },
        ].map(k => (
          <div key={k.label} style={{ ...glass, padding:'18px 20px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-16, right:-16, width:60, height:60, borderRadius:'50%', background:k.color, opacity:0.07 }} />
            <div style={{ fontSize:'1.4rem', marginBottom:8 }}>{k.icon}</div>
            {loading ? <div style={{ height:28, background:'rgba(255,255,255,0.06)', borderRadius:6, marginBottom:6, animation:'pulse 1.5s ease infinite' }} />
              : <div style={{ fontFamily:'JetBrains Mono', fontSize:'clamp(1.2rem,3vw,1.5rem)', fontWeight:700, color:k.color, marginBottom:4 }}>{k.value}</div>}
            <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{k.label}</div>
          </div>
        ))}
      </div>

      {/* Monthly Revenue Chart */}
      {monthLabels.length > 0 && (
        <div style={{ ...glass, padding:24, marginBottom:24 }}>
          <h2 style={{ fontSize:'0.9rem', fontWeight:700, color:'#fff', marginBottom:18 }}>📊 Monthly Revenue Trend</h2>
          <div style={{ height:220 }}>
            <Bar data={revenueChart} options={chartOpts as any} />
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div style={{ ...glass, overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
          <h2 style={{ fontSize:'0.9rem', fontWeight:700, color:'#fff' }}>🧾 All Transactions</h2>
        </div>
        <div style={{ overflowX:'auto' }}>
          <table style={{ width:'100%', borderCollapse:'collapse', minWidth:500 }}>
            <thead>
              <tr>
                {['User ID','Order ID','Plan','Amount','Status','Date'].map(h=>(
                  <th key={h} style={{ color:'rgba(255,255,255,0.5)', fontSize:'0.72rem', textTransform:'uppercase', letterSpacing:'0.05em', padding:'10px 14px', textAlign:'left', borderBottom:'1px solid rgba(255,255,255,0.06)', whiteSpace:'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? [...Array(5)].map((_,i)=>(
                <tr key={i}>{[...Array(6)].map((_,j)=>(
                  <td key={j} style={{padding:'12px 14px'}}><div style={{height:16,background:'rgba(255,255,255,0.05)',borderRadius:4,animation:'pulse 1.5s ease infinite'}}/></td>
                ))}</tr>
              )) : payments.length===0 ? (
                <tr><td colSpan={6} style={{textAlign:'center',padding:40,color:'rgba(255,255,255,0.3)',fontSize:'0.875rem'}}>No transactions yet</td></tr>
              ) : payments.map((p:any,i:number)=>(
                <tr key={i} style={{ borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                  <td style={{padding:'10px 14px',fontSize:'0.75rem',color:'rgba(255,255,255,0.35)',fontFamily:'JetBrains Mono'}}>{p.user_id?.slice(0,12)}…</td>
                  <td style={{padding:'10px 14px',fontSize:'0.75rem',color:'rgba(255,255,255,0.35)',fontFamily:'JetBrains Mono'}}>{p.razorpay_order_id?.slice(0,14) || '—'}</td>
                  <td style={{padding:'10px 14px'}}>
                    <span style={{fontSize:'0.72rem',padding:'2px 8px',borderRadius:20,background:'rgba(99,102,241,0.15)',color:'#818cf8',textTransform:'capitalize',fontWeight:600}}>{p.plan||'—'}</span>
                  </td>
                  <td style={{padding:'10px 14px',fontFamily:'JetBrains Mono',fontSize:'0.82rem',fontWeight:600,color:'#10b981'}}>₹{((p.amount||0)/100).toLocaleString('en-IN')}</td>
                  <td style={{padding:'10px 14px'}}>
                    <span style={{fontSize:'0.72rem',padding:'2px 8px',borderRadius:20,background:`rgba(${p.status==='success'?'16,185,129':p.status==='pending'?'245,158,11':'239,68,68'},0.12)`,color:statusColor(p.status),fontWeight:600,textTransform:'capitalize'}}>{p.status}</span>
                  </td>
                  <td style={{padding:'10px 14px',fontSize:'0.75rem',color:'rgba(255,255,255,0.4)',whiteSpace:'nowrap'}}>{p.created_at?new Date(p.created_at).toLocaleDateString('en-IN'):'-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

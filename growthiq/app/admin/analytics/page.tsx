'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, PointElement, LineElement, Tooltip, Legend);

const glass = { background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.08)', borderRadius:16, backdropFilter:'blur(20px)' };

const chartDefaults = {
  responsive: true, maintainAspectRatio: false,
  plugins: { legend: { display: false }, tooltip: { backgroundColor:'rgba(10,10,15,0.95)', titleColor:'#fff', bodyColor:'rgba(255,255,255,0.7)', padding:12, cornerRadius:8 } },
  scales: {
    x: { grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'rgba(255,255,255,0.4)', font:{size:11}} },
    y: { grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'rgba(255,255,255,0.4)', font:{size:11}}, border:{display:false} },
  },
};

export default function AdminAnalyticsPage() {
  const { fetchWithAuth } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth('/admin/analytics')
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { label:'Total Users',      value: data?.total_users ?? '—',      icon:'👥', color:'#6366f1' },
    { label:'Active Users',     value: data?.active_users ?? '—',     icon:'🟢', color:'#10b981' },
    { label:'AI Reports',       value: data?.total_analyses ?? '—',   icon:'📋', color:'#8b5cf6' },
    { label:'Avg Health Score', value: data ? `${data.avg_health_score}/100` : '—', icon:'🧠', color:'#f59e0b' },
    { label:'Revenue (₹)',      value: data ? `₹${Number(data.total_revenue_inr).toLocaleString('en-IN')}` : '—', icon:'💰', color:'#06b6d4' },
  ];

  // Monthly registrations chart
  const monthlyLabels = Object.keys(data?.monthly_registrations || {});
  const monthlyValues = Object.values(data?.monthly_registrations || {}) as number[];

  const monthlyChart = {
    labels: monthlyLabels.map(m => { const [y,mo]=m.split('-'); return `${['','Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][Number(mo)]} ${y.slice(2)}`; }),
    datasets: [{ label:'Registrations', data: monthlyValues, backgroundColor:'rgba(99,102,241,0.7)', borderRadius:6, hoverBackgroundColor:'#6366f1' }],
  };

  // Plan distribution doughnut
  const planDist = data?.plan_distribution || {};
  const planChart = {
    labels: ['Starter','Growth','Scale'],
    datasets: [{ data:[planDist.starter||0, planDist.growth||0, planDist.scale||0], backgroundColor:['rgba(255,255,255,0.15)','rgba(16,185,129,0.7)','rgba(99,102,241,0.8)'], borderWidth:0 }],
  };

  // Industry distribution
  const indDist = data?.industry_distribution || {};
  const indLabels = Object.keys(indDist).slice(0,8);
  const indValues = indLabels.map(k => indDist[k]) as number[];
  const indChart = {
    labels: indLabels,
    datasets: [{ label:'Users', data: indValues, backgroundColor:'rgba(139,92,246,0.7)', borderRadius:6, hoverBackgroundColor:'#8b5cf6' }],
  };

  const chartOpts = { ...chartDefaults, plugins: { ...chartDefaults.plugins, legend: { display: false } } };

  return (
    <div style={{ color:'#e2e8f0' }}>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontFamily:'Outfit', fontSize:'clamp(1.3rem,3vw,1.75rem)', fontWeight:800, color:'#fff', marginBottom:4 }}>📊 Analytics Dashboard</h1>
        <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'0.875rem' }}>Platform-wide performance metrics</p>
      </div>

      {/* KPIs */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:14, marginBottom:28 }}>
        {kpis.map(k => (
          <div key={k.label} style={{ ...glass, padding:'18px 20px', position:'relative', overflow:'hidden' }}>
            <div style={{ position:'absolute', top:-16, right:-16, width:60, height:60, borderRadius:'50%', background:k.color, opacity:0.07 }} />
            <div style={{ fontSize:'1.4rem', marginBottom:8 }}>{k.icon}</div>
            {loading ? <div style={{ height:28, background:'rgba(255,255,255,0.06)', borderRadius:6, marginBottom:6, animation:'pulse 1.5s ease infinite' }} />
              : <div style={{ fontFamily:'JetBrains Mono', fontSize:'clamp(1.3rem,3vw,1.6rem)', fontWeight:700, color:k.color, lineHeight:1.1, marginBottom:4 }}>{k.value}</div>}
            <div style={{ fontSize:'0.72rem', color:'rgba(255,255,255,0.4)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{k.label}</div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(min(100%,380px),1fr))', gap:20, marginBottom:20 }}>

        {/* Monthly Registrations */}
        <div style={{ ...glass, padding:24 }}>
          <h2 style={{ fontSize:'0.9rem', fontWeight:700, color:'#fff', marginBottom:18 }}>📅 Monthly Registrations</h2>
          {loading ? <div style={{ height:200, background:'rgba(255,255,255,0.03)', borderRadius:10, animation:'pulse 1.5s ease infinite' }} />
            : monthlyLabels.length === 0
              ? <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.8rem', textAlign:'center', padding:'60px 0' }}>No data yet</p>
              : <div style={{ height:200 }}><Bar data={monthlyChart} options={chartOpts as any} /></div>}
        </div>

        {/* Plan Distribution */}
        <div style={{ ...glass, padding:24 }}>
          <h2 style={{ fontSize:'0.9rem', fontWeight:700, color:'#fff', marginBottom:18 }}>💳 Plan Distribution</h2>
          {loading ? <div style={{ height:200, background:'rgba(255,255,255,0.03)', borderRadius:10, animation:'pulse 1.5s ease infinite' }} />
            : <div style={{ height:200, display:'flex', alignItems:'center', gap:20 }}>
                <div style={{ flex:1, height:'100%' }}>
                  <Doughnut data={planChart} options={{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ display:false }, tooltip:{ backgroundColor:'rgba(10,10,15,0.95)', titleColor:'#fff', bodyColor:'rgba(255,255,255,0.7)' } }, cutout:'70%' } as any} />
                </div>
                <div style={{ display:'flex', flexDirection:'column', gap:10, flexShrink:0 }}>
                  {[['Starter','rgba(255,255,255,0.15)',planDist.starter||0],['Growth','rgba(16,185,129,0.7)',planDist.growth||0],['Scale','rgba(99,102,241,0.8)',planDist.scale||0]].map(([l,c,v]) => (
                    <div key={String(l)} style={{ display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:10, height:10, borderRadius:3, background:String(c), flexShrink:0 }} />
                      <span style={{ fontSize:'0.78rem', color:'rgba(255,255,255,0.6)' }}>{l}: <strong style={{ color:'#fff' }}>{String(v)}</strong></span>
                    </div>
                  ))}
                </div>
              </div>}
        </div>
      </div>

      {/* Industry Distribution */}
      <div style={{ ...glass, padding:24 }}>
        <h2 style={{ fontSize:'0.9rem', fontWeight:700, color:'#fff', marginBottom:18 }}>🏭 Top Industries</h2>
        {loading ? <div style={{ height:220, background:'rgba(255,255,255,0.03)', borderRadius:10, animation:'pulse 1.5s ease infinite' }} />
          : indLabels.length === 0
            ? <p style={{ color:'rgba(255,255,255,0.3)', fontSize:'0.8rem', textAlign:'center', padding:'60px 0' }}>No industry data yet</p>
            : <div style={{ height:220 }}><Bar data={indChart} options={{ ...chartOpts, indexAxis:'y' } as any} /></div>}
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}`}</style>
    </div>
  );
}

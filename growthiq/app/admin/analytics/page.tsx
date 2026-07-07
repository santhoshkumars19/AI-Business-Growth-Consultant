'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

const months = ['Jan','Feb','Mar','Apr','May','Jun'];
const dau = [120,145,168,189,210,245];
const wau = [380,420,510,560,620,690];

const funnelData = [{ label:'Registered', value:500, pct:100 },{ label:'Completed Form', value:380, pct:76 },{ label:'Viewed Analysis', value:310, pct:62 },{ label:'Reached Dashboard', value:275, pct:55 },{ label:'Returned (month 2)', value:180, pct:36 }];

const devices = { labels:['Desktop','Mobile','Tablet'], datasets:[{ data:[58,34,8], backgroundColor:['#6366F1','#8B5CF6','#EC4899'], borderWidth:0 }] };
const dauChart = { labels:months, datasets:[{ label:'DAU', data:dau, borderColor:'#6366F1', backgroundColor:'rgba(99,102,241,0.1)', fill:true, tension:0.4 }] };
const wauChart = { labels:months, datasets:[{ label:'WAU', data:wau, borderColor:'#10B981', backgroundColor:'rgba(16,185,129,0.1)', fill:true, tension:0.4 }] };
const opts = { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ x:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'var(--text-muted)',font:{size:11}}}, y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'var(--text-muted)',font:{size:11}},border:{display:false}} } };

interface StatsData {
  total_users: number;
  total_analyses: number;
  avg_health_score: number;
  total_revenue_inr: number;
  plan_distribution: Record<string, number>;
}

export default function AdminAnalyticsPage() {
  const { fetchWithAuth, user } = useAuth();
  const [stats, setStats] = useState<StatsData>({
    total_users: 500,
    total_analyses: 320,
    avg_health_score: 72.5,
    total_revenue_inr: 85000,
    plan_distribution: { starter: 380, growth: 95, scale: 25 }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAnalytics = async () => {
      if (!user || user.role !== 'admin') {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchWithAuth('/admin/analytics');
        if (data && typeof data === 'object') {
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load admin analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      loadAnalytics();
    }
  }, [user]);

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:4 }}>Platform Analytics</h1>
        <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem' }}>User engagement and platform usage statistics</p>
      </div>

      <div className="grid-4" style={{ marginBottom:24 }}>
        {[
          ['👥','Total Users', stats.total_users, '+45 this month', 'primary'],
          ['🤖','Total Analyses', stats.total_analyses, 'AI model queries', 'success'],
          ['🧠','Avg Health Score', `${stats.avg_health_score}%`, 'Across all businesses', 'warning'],
          ['💳','Total Revenue', `₹${stats.total_revenue_inr.toLocaleString('en-IN')}`, 'Payments processed', 'danger']
        ].map(([icon, label, val, sub, color])=>(
          <div key={String(label)} className="admin-stat">
            <span style={{ fontSize:'1.5rem' }}>{icon}</span>
            <div className="admin-kpi" style={{ color:`var(--accent-${color})`, marginTop:6 }}>{val}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>{label}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:4 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom:20 }}>
        <div className="card p-6"><h3 style={{ fontWeight:700, marginBottom:14 }}>📈 Daily Active Users</h3><div style={{ height:160 }}><Line data={dauChart} options={opts as Parameters<typeof Line>[0]['options']} /></div></div>
        <div className="card p-6"><h3 style={{ fontWeight:700, marginBottom:14 }}>📊 Weekly Active Users</h3><div style={{ height:160 }}><Line data={wauChart} options={opts as Parameters<typeof Line>[0]['options']} /></div></div>
      </div>

      <div className="grid-2">
        <div className="card p-6">
          <h3 style={{ fontWeight:700, marginBottom:16 }}>🔽 Onboarding Funnel</h3>
          {funnelData.map((step, i)=>(
            <div key={i} style={{ marginBottom:10 }}>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:4, fontSize:'0.82rem' }}>
                <span>{step.label}</span>
                <span style={{ fontFamily:'JetBrains Mono', fontWeight:600 }}>{step.value} <span style={{ color:'var(--text-muted)', fontFamily:'Inter' }}>({step.pct}%)</span></span>
              </div>
              <div className="progress-track"><div className="progress-fill" style={{ width:`${step.pct}%`, background:`hsl(${240-i*30}, 70%, 60%)` }} /></div>
            </div>
          ))}
        </div>
        <div className="card p-6">
          <h3 style={{ fontWeight:700, marginBottom:16 }}>💻 Device Breakdown</h3>
          <div style={{ height:160, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Doughnut data={devices} options={{ responsive:true, maintainAspectRatio:false, plugins:{ legend:{ position:'right', labels:{color:'var(--text-secondary)',font:{size:11},padding:16} } } } as Parameters<typeof Doughnut>[0]['options']} />
          </div>
        </div>
      </div>
    </div>
  );
}

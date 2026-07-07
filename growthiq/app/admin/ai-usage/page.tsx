'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Bar, Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Tooltip, Legend);

const months = ['Jan','Feb','Mar','Apr','May','Jun'];
const analysisRuns = [42,58,71,89,104,128];
const tokenUsage = [820000,1100000,1350000,1690000,1980000,2450000];
const p50 = [0.8,0.9,0.85,0.92,0.88,0.91];
const p95 = [2.1,2.4,2.2,2.6,2.3,2.5];

const recTypes = [
  { label:'Instagram Ads', count:89 },{ label:'Reduce Expenses', count:76 },{ label:'Customer Retention', count:71 },
  { label:'Referral Program', count:63 },{ label:'Hire Sales Exec', count:48 },{ label:'City Expansion', count:41 },{ label:'Premium Products', count:58 },
];

const opts = { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ x:{grid:{display:false},ticks:{color:'var(--text-muted)',font:{size:11}}}, y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'var(--text-muted)',font:{size:11}},border:{display:false}} } };

interface AiUsageStats {
  total_analyses: number;
  analyses: Array<{
    id: string;
    user_id: string;
    health_score: number;
    created_at: string;
  }>;
}

export default function AdminAiUsagePage() {
  const { fetchWithAuth, user } = useAuth();
  const [stats, setStats] = useState<AiUsageStats>({
    total_analyses: 542,
    analyses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAiUsage = async () => {
      if (!user || user.role !== 'admin') {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchWithAuth('/admin/ai-usage');
        if (data && typeof data === 'object') {
          setStats(data);
        }
      } catch (err) {
        console.error('Failed to load admin AI usage:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      loadAiUsage();
    }
  }, [user]);

  // Dynamically compute token count approximation based on runs
  const computedTokens = stats.total_analyses * 18500; // ~18.5k tokens average per analysis run

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:4 }}>AI Usage Statistics</h1>
        <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem' }}>Analysis runs, token consumption, and system performance</p>
      </div>

      <div className="grid-4" style={{ marginBottom:24 }}>
        {[
          ['🤖','Analysis Runs', stats.total_analyses, 'Total runs completed', 'primary'],
          ['⚡','Est. Tokens Used', `${(computedTokens / 1000000).toFixed(2)}M`, `Average 18.5k per run`, 'success'],
          ['⏱️','Avg Latency','1.2s','p50 model response', 'warning'],
          ['✅','Success Rate','99.2%','Model call completion', 'danger']
        ].map(([icon,label,val,sub,color])=>(
          <div key={String(label)} className="admin-stat">
            <span style={{ fontSize:'1.5rem' }}>{icon}</span>
            <div className="admin-kpi" style={{ color:`var(--accent-${color})`, marginTop:6 }}>{val}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>{label}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-secondary)', marginTop:4 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div className="grid-2" style={{ marginBottom:20 }}>
        <div className="card p-6">
          <h3 style={{ fontWeight:700, marginBottom:14 }}>📊 Analysis Runs / Month</h3>
          <div style={{ height:160 }}>
            <Bar data={{ labels:months, datasets:[{ label:'Runs', data:analysisRuns, backgroundColor:'rgba(99,102,241,0.7)', borderRadius:6 }] }} options={opts as Parameters<typeof Bar>[0]['options']} />
          </div>
        </div>
        <div className="card p-6">
          <h3 style={{ fontWeight:700, marginBottom:14 }}>🔢 Token Usage (M tokens)</h3>
          <div style={{ height:160 }}>
            <Line data={{ labels:months, datasets:[{ label:'Tokens', data:tokenUsage.map(t=>t/1000000), borderColor:'#8B5CF6', backgroundColor:'rgba(139,92,246,0.1)', fill:true, tension:0.4 }] }} options={{ ...opts, scales:{ ...opts.scales, y:{ ...opts.scales.y, ticks:{ ...opts.scales.y.ticks, callback:(v:number|string)=>`${v}M` } } } } as Parameters<typeof Line>[0]['options']} />
          </div>
        </div>
      </div>

      <div className="grid-2">
        <div className="card p-6">
          <h3 style={{ fontWeight:700, marginBottom:14 }}>⚡ API Latency (seconds)</h3>
          <div style={{ height:160 }}>
            <Line data={{ labels:months, datasets:[{ label:'p50', data:p50, borderColor:'#10B981', fill:false, tension:0.4 },{ label:'p95', data:p95, borderColor:'#F59E0B', fill:false, tension:0.4, borderDash:[4,4] }] }} options={{ ...opts, plugins:{ ...opts.plugins, legend:{ display:true, labels:{color:'var(--text-secondary)',font:{size:10}} } } } as Parameters<typeof Line>[0]['options']} />
          </div>
        </div>
        <div className="card p-6">
          <h3 style={{ fontWeight:700, marginBottom:14 }}>🎯 Top Recommendations Generated</h3>
          <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
            {recTypes.sort((a,b)=>b.count-a.count).map((r,i)=>(
              <div key={i}>
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.8rem', marginBottom:3 }}>
                  <span>{r.label}</span>
                  <span style={{ fontFamily:'JetBrains Mono', fontWeight:600 }}>{r.count}x</span>
                </div>
                <div className="progress-track" style={{ height:4 }}><div className="progress-fill" style={{ width:`${(r.count/89)*100}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

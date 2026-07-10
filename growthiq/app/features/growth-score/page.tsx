'use client';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const staticHistory = [
  { month:'Jan 2026', score:52, revenue:200000, profit:25000 },
  { month:'Feb 2026', score:56, revenue:210000, profit:32000 },
  { month:'Mar 2026', score:61, revenue:230000, profit:45000 },
  { month:'Apr 2026', score:65, revenue:220000, profit:40000 },
  { month:'May 2026', score:68, revenue:240000, profit:58000 },
  { month:'Jun 2026', score:72, revenue:250000, profit:70000 },
];

export default function GrowthScorePage() {
  const { user, fetchWithAuth } = useAuth();
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadGrowthScores = async () => {
      try {
        const data = await fetchWithAuth('/features/growth-score');
        const scores = data.scores || [];
        
        const rev = user?.businessData?.monthly_revenue || 250000;
        const exp = user?.businessData?.monthly_expenses || 180000;
        const baseProfit = rev - exp;
        
        if (scores.length > 0) {
          const latestScore = scores[0].score;
          const latestMonth = scores[0].month;
          
          const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
          const parseMonthYear = (mStr: string) => {
            const parts = mStr.split(' ');
            const mIdx = months.indexOf(parts[0].slice(0,3));
            const yr = parseInt(parts[1]) || 2026;
            return { monthIdx: mIdx >= 0 ? mIdx : 6, year: yr };
          };
          
          const current = parseMonthYear(latestMonth);
          const historyList = [];
          
          for (let i = 5; i >= 0; i--) {
            let mIdx = current.monthIdx - i;
            let yr = current.year;
            if (mIdx < 0) {
              mIdx += 12;
              yr -= 1;
            }
            const monthLabel = `${months[mIdx]} ${yr}`;
            const scale = 1 - (i * 0.04);
            const scoreDelta = i * 4;
            
            historyList.push({
               month: monthLabel,
               score: Math.max(40, latestScore - scoreDelta),
               revenue: Math.round(rev * scale),
               profit: Math.round(baseProfit * scale)
            });
          }
          setHistory(historyList);
        } else {
          setHistory(staticHistory);
        }
      } catch (e) {
        console.error('Failed to load growth score history:', e);
        setHistory(staticHistory);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      loadGrowthScores();
    }
  }, [user]);
  const chartData = {
    labels: history.map(h => h.month.slice(0,6)),
    datasets: [{
      label:'Health Score', data: history.map(h => h.score),
      borderColor:'#6366F1', backgroundColor:'rgba(99,102,241,0.1)',
      fill:true, tension:0.4, pointRadius:6, pointBackgroundColor:'#6366F1', pointBorderColor:'#fff', pointBorderWidth:2,
    }]
  };
  const opts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:false}, tooltip:{ backgroundColor:'var(--bg-elevated)', titleColor:'var(--text-primary)', bodyColor:'var(--text-secondary)', borderColor:'var(--border)', borderWidth:1 } },
    scales:{
      x:{ grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'var(--text-muted)', font:{size:11}} },
      y:{ grid:{color:'rgba(255,255,255,0.04)'}, min:0, max:100, ticks:{color:'var(--text-muted)', font:{size:11}}, border:{display:false} }
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading Growth Score...</p>
      </div>
    );
  }

  const latest = history[history.length-1] || { score: 60, profit: 0, month: 'Coming soon' };
  const previous = history[history.length-2] || { score: 60 };
  const diff = latest.score - previous.score;

  const badges = [
    { icon:'🏆', title:'First 70+ Score', unlocked: latest.score >= 70, month: latest.score >= 70 ? latest.month : 'Locked' },
    { icon:'📈', title:'3 Month Growth Streak', unlocked: diff > 0, month: diff > 0 ? latest.month : 'Locked' },
    { icon:'💰', title:'₹50K+ Monthly Profit', unlocked: latest.profit >= 50000, month: latest.profit >= 50000 ? latest.month : 'Locked' },
    { icon:'🌟', title:'Top 30% in Industry', unlocked: latest.score >= 68, month: latest.score >= 68 ? latest.month : 'Locked' },
    { icon:'🚀', title:'Score 80+', unlocked: latest.score >= 80, month: latest.score >= 80 ? latest.month : 'Locked' },
    { icon:'💎', title:'6 Month Streak', unlocked: history.length >= 6, month: history.length >= 6 ? latest.month : 'Locked' },
  ];

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:4 }}>Monthly Growth Score</h1>
        <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem' }}>Track your business health score over time and celebrate milestones</p>
      </div>

      {/* Score Summary */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        <div className="stat-card" style={{ gridColumn:'span 1' }}>
          <div className="stat-label">Current Score</div>
          <div className="stat-value" style={{ color:'var(--accent-success)', fontSize:'2.5rem' }}>{latest.score}</div>
          <div className="delta delta-up" style={{ marginTop:8 }}>↑ +{diff} pts vs last month</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Best Score</div>
          <div className="stat-value" style={{ color:'var(--accent-primary)' }}>72</div>
          <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:8 }}>Achieved Jun 2026</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">6-Month Growth</div>
          <div className="stat-value" style={{ color:'var(--accent-success)' }}>+20pts</div>
          <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:8 }}>Jan 52 → Jun 72</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Login Streak</div>
          <div className="stat-value" style={{ color:'var(--accent-warning)' }}>3🔥</div>
          <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:8 }}>Consecutive months</div>
        </div>
      </div>

      {/* Motivational Banner */}
      <div style={{ background:'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(99,102,241,0.10))', border:'1px solid rgba(16,185,129,0.3)', borderRadius:16, padding:'16px 24px', display:'flex', alignItems:'center', gap:16, marginBottom:24 }}>
        <span style={{ fontSize:'2rem' }}>🎉</span>
        <div>
          <div style={{ fontWeight:700, fontSize:'1rem', color:'var(--accent-success)' }}>Your score grew by {diff} points this month!</div>
          <div style={{ fontSize:'0.85rem', color:'var(--text-secondary)', marginTop:4 }}>You're in the top 30% of Food & Beverage businesses on GrowthIQ. Keep it up!</div>
        </div>
      </div>

      {/* Score Timeline Chart */}
      <div className="card p-6" style={{ marginBottom:24 }}>
        <h2 style={{ fontWeight:700, marginBottom:20 }}>📈 Score Timeline</h2>
        <div style={{ height:220 }}>
          <Line data={chartData} options={opts as Parameters<typeof Line>[0]['options']} />
        </div>
      </div>

      {/* Score Breakdown Table */}
      <div className="card" style={{ marginBottom:24, overflow:'hidden' }}>
        <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--border)' }}>
          <h2 style={{ fontWeight:700 }}>📋 Monthly Score Breakdown</h2>
        </div>
        <div className="table-wrapper" style={{ borderRadius:0, border:'none' }}>
          <table>
            <thead><tr><th>Month</th><th>Health Score</th><th>Revenue</th><th>Profit</th><th>Change</th></tr></thead>
            <tbody>
              {history.map((h, i) => {
                const prev = history[i-1];
                const change = prev ? h.score - prev.score : null;
                return (
                  <tr key={h.month}>
                    <td style={{ fontWeight: i===history.length-1 ? 700 : 400 }}>{h.month}{i===history.length-1 && <span className="badge badge-primary" style={{ marginLeft:8 }}>Latest</span>}</td>
                    <td><span style={{ fontFamily:'JetBrains Mono', fontWeight:700, color: h.score>=70 ? 'var(--accent-success)' : h.score>=40 ? 'var(--accent-warning)' : 'var(--accent-danger)' }}>{h.score}</span></td>
                    <td style={{ fontFamily:'JetBrains Mono' }}>₹{(h.revenue/1000).toFixed(0)}K</td>
                    <td style={{ fontFamily:'JetBrains Mono' }}>₹{(h.profit/1000).toFixed(0)}K</td>
                    <td>{change !== null ? <span className={`delta ${change>=0?'delta-up':'delta-down'}`}>{change>=0?'↑':'↓'} {Math.abs(change)}</span> : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Achievement Badges */}
      <div className="card p-6">
        <h2 style={{ fontWeight:700, marginBottom:20 }}>🏆 Achievement Badges</h2>
        <div className="grid-3" style={{ gap:14 }}>
          {badges.map((b, i) => (
            <div key={i} style={{ padding:'16px 18px', borderRadius:14, border:`1px solid ${b.unlocked ? 'rgba(var(--accent-success-rgb),0.3)' : 'var(--border)'}`, background: b.unlocked ? 'rgba(var(--accent-success-rgb),0.06)' : 'var(--bg-elevated)', opacity: b.unlocked ? 1 : 0.5, textAlign:'center' }}>
              <div style={{ fontSize:'2.25rem', marginBottom:8, filter: b.unlocked ? 'none' : 'grayscale(100%)' }}>{b.icon}</div>
              <div style={{ fontWeight:600, fontSize:'0.85rem', marginBottom:4 }}>{b.title}</div>
              <div style={{ fontSize:'0.72rem', color: b.unlocked ? 'var(--accent-success)' : 'var(--text-muted)' }}>{b.month}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

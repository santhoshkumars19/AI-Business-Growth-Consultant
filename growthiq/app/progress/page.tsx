'use client';
import { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip);

const history = [
  { month:'Jan 2026', score:52, revenue:200000, expenses:175000, profit:25000, customers:120, recs:7, implemented:2 },
  { month:'Feb 2026', score:56, revenue:210000, expenses:178000, profit:32000, customers:128, recs:7, implemented:3 },
  { month:'Mar 2026', score:61, revenue:230000, expenses:185000, profit:45000, customers:135, recs:7, implemented:4 },
  { month:'Apr 2026', score:65, revenue:220000, expenses:180000, profit:40000, customers:142, recs:7, implemented:3 },
  { month:'May 2026', score:68, revenue:240000, expenses:182000, profit:58000, customers:155, recs:7, implemented:5 },
  { month:'Jun 2026', score:72, revenue:250000, expenses:180000, profit:70000, customers:165, recs:7, implemented:4 },
];

const recommendations = [
  { title:'Increase Instagram Ads', status:'done', impact:'23% more leads achieved' },
  { title:'Reduce Unnecessary Expenses', status:'done', impact:'Saved ₹18K this month' },
  { title:'Improve Customer Retention', status:'in-progress', impact:'Churn reduced from 18% to 14%' },
  { title:'Launch Referral Program', status:'done', impact:'32 new customers from referrals' },
  { title:'Hire One Sales Executive', status:'pending', impact:'Not started yet' },
  { title:'Expand to Nearby Cities', status:'pending', impact:'Market research underway' },
  { title:'Introduce Premium Products', status:'in-progress', impact:'2 premium items launched' },
];

export default function ProgressPage() {
  const [selectedMonth, setSelectedMonth] = useState(5);
  const current = history[selectedMonth];
  const previous = history[selectedMonth-1] || current;
  const diff = current.score - previous.score;

  const chartData = {
    labels: history.map(h=>h.month.slice(0,3)),
    datasets: [
      { label:'Health Score', data:history.map(h=>h.score), borderColor:'#6366F1', backgroundColor:'rgba(99,102,241,0.1)', fill:true, tension:0.4, pointRadius:5, pointBackgroundColor:history.map((_,i)=>i===selectedMonth?'#6366F1':'rgba(99,102,241,0.5)'), pointBorderColor:'#fff', pointBorderWidth:2 }
    ]
  };
  const opts = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{display:false}, tooltip:{ callbacks:{ label:(ctx:{raw:number})=>`Score: ${ctx.raw}` } } },
    onClick:(_: unknown, elements: { index: number }[])=>{ if(elements.length) setSelectedMonth(elements[0].index); },
    scales:{
      x:{ grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'var(--text-muted)',font:{size:11}} },
      y:{ grid:{color:'rgba(255,255,255,0.04)'}, min:0, max:100, ticks:{color:'var(--text-muted)',font:{size:11}}, border:{display:false} }
    }
  };

  const doneCount = recommendations.filter(r=>r.status==='done').length;
  const scoreColor = current.score>=70?'var(--accent-success)':current.score>=40?'var(--accent-warning)':'var(--accent-danger)';

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:4 }}>Progress Tracking</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem' }}>Your business growth journey over time</p>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <button onClick={()=>setSelectedMonth(m=>Math.max(0,m-1))} className="btn btn-ghost btn-sm" disabled={selectedMonth===0}>←</button>
          <span style={{ fontWeight:600, fontSize:'0.875rem', minWidth:90, textAlign:'center' }}>{current.month}</span>
          <button onClick={()=>setSelectedMonth(m=>Math.min(history.length-1,m+1))} className="btn btn-ghost btn-sm" disabled={selectedMonth===history.length-1}>→</button>
        </div>
      </div>

      {/* Motivational Banner */}
      {diff >= 0 && (
        <div style={{ background:'linear-gradient(135deg, rgba(16,185,129,0.12), rgba(99,102,241,0.08))', border:'1px solid rgba(16,185,129,0.3)', borderRadius:14, padding:'14px 22px', display:'flex', alignItems:'center', gap:14, marginBottom:20 }}>
          <span style={{ fontSize:'1.75rem' }}>🎉</span>
          <div>
            <div style={{ fontWeight:700, color:'var(--accent-success)' }}>Score improved by {diff} points in {current.month}!</div>
            <div style={{ fontSize:'0.85rem', color:'var(--text-secondary)' }}>You're in the top 30% of businesses on GrowthIQ. Keep implementing recommendations!</div>
          </div>
          <div style={{ marginLeft:'auto', textAlign:'center' }}>
            <div style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'2.5rem', color:scoreColor }}>{current.score}</div>
            <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>Current Score</div>
          </div>
        </div>
      )}

      {/* KPI Comparison */}
      <div className="grid-4" style={{ marginBottom:20 }}>
        {[
          ['💰','Revenue',`₹${(current.revenue/1000).toFixed(0)}K`,current.revenue-previous.revenue,true],
          ['📈','Profit',`₹${(current.profit/1000).toFixed(0)}K`,current.profit-previous.profit,true],
          ['👥','Customers',''+current.customers,current.customers-previous.customers,true],
          ['📉','Expenses',`₹${(current.expenses/1000).toFixed(0)}K`,current.expenses-previous.expenses,false],
        ].map(([icon,label,val,delta,upIsGood])=>(
          <div key={String(label)} className="stat-card">
            <div style={{ display:'flex', justifyContent:'space-between' }}>
              <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'0.05em' }}>{label}</span>
              <span style={{ fontSize:'1.25rem' }}>{icon}</span>
            </div>
            <div className="stat-value" style={{ marginTop:6, fontSize:'1.5rem' }}>{val}</div>
            {Number(delta) !== 0 && (
              <div style={{ marginTop:8 }}>
                <span className={`delta ${(Number(delta)>0)===upIsGood?'delta-up':'delta-down'}`}>
                  {Number(delta)>0?'↑':'↓'} {Math.abs(Number(delta)).toLocaleString('en-IN')}
                </span>
                <span style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginLeft:6 }}>vs {previous.month.slice(0,3)}</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Score Timeline */}
      <div className="card p-6" style={{ marginBottom:20 }}>
        <h2 style={{ fontWeight:700, marginBottom:4 }}>📈 Health Score Timeline</h2>
        <p style={{ fontSize:'0.8rem', color:'var(--text-muted)', marginBottom:16 }}>Click any data point to view that month's breakdown</p>
        <div style={{ height:200 }}><Line data={chartData} options={opts as Parameters<typeof Line>[0]['options']} /></div>
      </div>

      {/* Recommendation Progress */}
      <div className="card p-6">
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h2 style={{ fontWeight:700 }}>🎯 Recommendation Implementation</h2>
          <div>
            <span style={{ fontFamily:'JetBrains Mono', fontWeight:700, color:'var(--accent-success)', fontSize:'1.25rem' }}>{doneCount}/{recommendations.length}</span>
            <span style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginLeft:6 }}>completed</span>
          </div>
        </div>
        <div className="progress-track" style={{ marginBottom:20 }}>
          <div className="progress-fill success" style={{ width:`${(doneCount/recommendations.length)*100}%` }} />
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
          {recommendations.map((r,i)=>(
            <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'12px 16px', borderRadius:12, border:'1px solid var(--border)', background:'var(--bg-elevated)' }}>
              <div style={{ fontSize:'1.25rem', flexShrink:0 }}>{r.status==='done'?'✅':r.status==='in-progress'?'⏳':'⭕'}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontWeight:r.status==='done'?400:600, fontSize:'0.875rem', textDecoration:r.status==='done'?'line-through':'none', color:r.status==='done'?'var(--text-muted)':'var(--text-primary)' }}>{r.title}</div>
                {r.status !== 'pending' && <div style={{ fontSize:'0.75rem', color:'var(--accent-success)', marginTop:2 }}>{r.impact}</div>}
              </div>
              <span className={`badge ${r.status==='done'?'badge-success':r.status==='in-progress'?'badge-warning':'badge-muted'}`} style={{ textTransform:'capitalize' }}>{r.status.replace('-',' ')}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

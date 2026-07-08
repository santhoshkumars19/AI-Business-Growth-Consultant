'use client';
import { useState, useMemo } from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const BUDGET_CATEGORIES = ['marketing', 'operations', 'salaries', 'tech', 'misc'] as const;
type BudgetCategory = (typeof BUDGET_CATEGORIES)[number];
const DEFAULT_BUDGET: Record<BudgetCategory, number> = { marketing:28000, operations:30000, salaries:85000, tech:8000, misc:7000 };
const REVENUE_MULTIPLIERS: Record<BudgetCategory, number> = { marketing:2.5, operations:0.3, salaries:1.8, tech:0.8, misc:0.2 };
const CATEGORY_LABELS: Record<BudgetCategory, string> = { marketing:'Marketing & Ads', operations:'Operations', salaries:'Salaries', tech:'Tech & Tools', misc:'Miscellaneous' };
const CATEGORY_COLORS: Record<BudgetCategory, string> = { marketing:'#6366F1', operations:'#8B5CF6', salaries:'#EC4899', tech:'#10B981', misc:'#F59E0B' };

export default function BudgetEstimatorPage() {
  const [budget, setBudget] = useState(DEFAULT_BUDGET);
  const [revenueTarget, setRevenueTarget] = useState(300000);
  const [period, setPeriod] = useState('1M');

  const set = (k: keyof typeof DEFAULT_BUDGET, v: number) => setBudget(b => ({ ...b, [k]: v }));
  const totalBudget = Object.values(budget).reduce((a,b)=>a+b,0);
  const budgetEntries = Object.entries(budget) as [BudgetCategory, number][];
  const budgetKeys = Object.keys(budget) as BudgetCategory[];
  const projectedRevenue = useMemo(() =>
    budgetEntries.reduce((acc,[k,v]) => acc + (v * REVENUE_MULTIPLIERS[k]), 0)
  , [budgetEntries]);
  const roi = totalBudget > 0 ? (((projectedRevenue - totalBudget) / totalBudget)*100).toFixed(1) : '0';
  const breakeven = totalBudget;
  const periods = ['1M','3M','6M','12M'];

  const chartData = {
    labels: budgetKeys.map(k => CATEGORY_LABELS[k]),
    datasets: [
      { label:'Budget Spent', data:budgetKeys.map(k => budget[k]), backgroundColor:budgetKeys.map(k => CATEGORY_COLORS[k]), borderRadius:6 },
      { label:'Projected Return', data:budgetKeys.map(k => budget[k] * REVENUE_MULTIPLIERS[k]), backgroundColor:budgetKeys.map(k => `${CATEGORY_COLORS[k]}60`), borderRadius:6 },
    ]
  };
  const chartOptions = {
    responsive:true, maintainAspectRatio:false,
    plugins:{ legend:{ labels:{ color:'var(--text-secondary)', font:{size:11} } }, tooltip:{ callbacks:{ label:(ctx: {dataset:{label:string}, raw:number})=>`${ctx.dataset.label}: ₹${ctx.raw.toLocaleString('en-IN')}` } } },
    scales:{
      x:{ grid:{display:false}, ticks:{color:'var(--text-muted)',font:{size:10}} },
      y:{ grid:{color:'rgba(255,255,255,0.04)'}, ticks:{color:'var(--text-muted)',font:{size:10}, callback:(v: number|string)=>`₹${(Number(v)/1000).toFixed(0)}K`}, border:{display:false} }
    }
  };

  const tips = [
    budget.marketing/totalBudget < 0.1 && 'Marketing spend is below 10% of total budget. Consider increasing for growth phase.',
    budget.salaries/totalBudget > 0.6 && 'Salary costs are above 60% of total budget. Monitor closely as you scale.',
    projectedRevenue < revenueTarget && `Current allocation falls ₹${(revenueTarget-projectedRevenue).toLocaleString('en-IN')} short of your target. Increase Marketing budget for the highest ROI.`,
    Number(roi) > 80 && 'Great ROI projection! Consider reinvesting profits into further scaling.',
  ].filter(Boolean);

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:4 }}>Budget Estimator</h1>
        <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem' }}>Adjust budget allocations and see real-time ROI projections</p>
      </div>

      {/* Period selector */}
      <div style={{ display:'flex', gap:8, marginBottom:20 }}>
        {periods.map(p=>(
          <button key={p} onClick={()=>setPeriod(p)} className="btn btn-sm" style={{ background:period===p?'var(--accent-primary)':'var(--bg-elevated)', color:period===p?'#fff':'var(--text-secondary)' }}>{p}</button>
        ))}
        <span style={{ fontSize:'0.82rem', color:'var(--text-muted)', alignSelf:'center', marginLeft:8 }}>Projection period</span>
      </div>

      <div className="grid-2" style={{ alignItems:'start' }}>
        {/* Input Panel */}
        <div className="card p-6">
          <h2 style={{ fontWeight:700, marginBottom:20 }}>💰 Budget Allocation</h2>
          <div style={{ marginBottom:20 }}>
            <div className="input-group">
              <label className="input-label">Revenue Target (₹)</label>
              <input className="input" type="number" value={revenueTarget} onChange={e=>setRevenueTarget(Number(e.target.value))} />
              <div className="input-helper">What's your revenue goal for the period?</div>
            </div>
          </div>
          <div className="divider" style={{ marginBottom:20 }} />
          {budgetKeys.map(k => {
            const pct = totalBudget > 0 ? ((budget[k]/totalBudget)*100).toFixed(0) : 0;
            return (
              <div key={k} style={{ marginBottom:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', marginBottom:6 }}>
                  <label className="input-label" style={{ display:'flex', alignItems:'center', gap:6 }}>
                    <div style={{ width:10, height:10, borderRadius:'50%', background:CATEGORY_COLORS[k] }} />
                    {CATEGORY_LABELS[k]}
                  </label>
                  <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                    <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{pct}%</span>
                    <span style={{ fontFamily:'JetBrains Mono', fontWeight:600, fontSize:'0.875rem' }}>₹{budget[k].toLocaleString('en-IN')}</span>
                  </div>
                </div>
                <input type="range" min="0" max={200000} step={1000} value={budget[k]} onChange={e=>set(k,Number(e.target.value))} style={{ accentColor:CATEGORY_COLORS[k] }} />
                <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.7rem', color:'var(--text-muted)', marginTop:2 }}>
                  <span>₹0</span><span>₹2,00,000</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Output Panel */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* KPI Cards */}
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <div className="stat-card">
              <div className="stat-label">Total Budget</div>
              <div className="stat-value" style={{ fontSize:'1.5rem', color:'var(--accent-primary)' }}>₹{totalBudget.toLocaleString('en-IN')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Projected Revenue</div>
              <div className="stat-value" style={{ fontSize:'1.5rem', color:'var(--accent-success)' }}>₹{Math.round(projectedRevenue).toLocaleString('en-IN')}</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Projected ROI</div>
              <div className="stat-value" style={{ fontSize:'1.5rem', color: Number(roi)>50?'var(--accent-success)':Number(roi)>0?'var(--accent-warning)':'var(--accent-danger)' }}>{roi}%</div>
            </div>
            <div className="stat-card">
              <div className="stat-label">Break-even</div>
              <div className="stat-value" style={{ fontSize:'1.4rem', color:'var(--accent-warning)' }}>₹{breakeven.toLocaleString('en-IN')}</div>
            </div>
          </div>





          {/* AI Tips */}
          {tips.length > 0 && (
            <div className="card p-5">
              <h3 style={{ fontWeight:700, marginBottom:12 }}>🤖 AI Recommendations</h3>
              <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                {tips.map((tip,i)=>(
                  <div key={i} style={{ padding:'12px 16px', background:'var(--bg-elevated)', border:'1px solid var(--border)', borderLeft:'4px solid var(--accent-primary)', borderRadius:8, fontSize:'0.82rem', lineHeight:1.6, color:'var(--text-secondary)' }}>
                    💡 {tip}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

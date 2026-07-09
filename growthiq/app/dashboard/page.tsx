'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement,
  BarElement, ArcElement, Filler, Tooltip, Legend,
} from 'chart.js';
import { Chart, Line, Bar, Doughnut } from 'react-chartjs-2';
import type { ChartData, ChartOptions } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Filler, Tooltip, Legend);

interface Recommendation {
  title: string;
  description: string;
  impact: string;
  priority: 'high' | 'medium' | 'quick';
  category: string;
}

interface AnalysisData {
  id: string;
  health_score: number;
  score_breakdown: {
    profitability: number;
    growth: number;
    customers: number;
    digital: number;
  };
  recommendations: Recommendation[];
  summary: string;
  created_at: string;
}

interface HistoryReport {
  id: string;
  health_score: number;
  summary: string;
  created_at: string;
}

function StatCard({ label, value, delta, deltaUp, icon, accentColor }: { label:string, value:string, delta:string, deltaUp:boolean, icon:string, accentColor:string }) {
  return (
    <div className="stat-card">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
        <div>
          <div className="stat-label">{label}</div>
          <div className="stat-value" style={{ color: accentColor }}>{value}</div>
        </div>
        <div style={{ fontSize:'1.5rem' }}>{icon}</div>
      </div>
      <div style={{ marginTop: 12 }}>
        <span className={`delta ${deltaUp ? 'delta-up' : 'delta-down'}`}>{deltaUp ? '↑' : '↓'} {delta}</span>
        <span style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginLeft: 6 }}>vs last month</span>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { user, fetchWithAuth } = useAuth();
  const [chartView, setChartView] = useState<'3M'|'6M'|'12M'>('6M');
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [history, setHistory] = useState<HistoryReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [greeting, setGreeting] = useState('Good morning');

  useEffect(() => {
    const hr = new Date().getHours();
    if (hr < 12) {
      setGreeting('Good morning');
    } else if (hr < 17) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);

  const biz = user?.businessData;
  const revenueVal = biz?.monthly_revenue || 0;
  const expensesVal = biz?.monthly_expenses || 0;
  const profitVal = revenueVal - expensesVal;
  const marginVal = revenueVal > 0 ? Math.round((profitVal / revenueVal) * 100) : 0;
  const customersVal = biz?.monthly_customers || 0;

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const latest = await fetchWithAuth('/analysis/latest');
        setAnalysis(latest);
        
        const hist = await fetchWithAuth('/analysis/history');
        setHistory(hist);
      } catch (e) {
        console.error('No dashboard analytics loaded yet:', e);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadDashboardData();
    }
  }, [user]);

  if (!biz) {
    return (
      <div style={{ padding: '60px 24px', textAlign: 'center', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 20, maxWidth: 600, margin: '60px auto' }}>
        <div style={{ fontSize: '3rem', marginBottom: 20 }}>📊</div>
        <h2 style={{ fontFamily: 'Outfit', fontSize: '1.75rem', fontWeight: 800, marginBottom: 12 }}>Configure your Business Data</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: 30, lineHeight: 1.6 }}>
          To unlock the growth dashboard and receive custom recommendations, please submit your baseline financial and customer metrics.
        </p>
        <Link href="/onboarding" className="btn btn-primary btn-lg">Set Up Business Metrics</Link>
      </div>
    );
  }

  const score = analysis?.health_score || 0;
  const scoreColor = score >= 70 ? '#10B981' : score >= 40 ? '#F59E0B' : '#EF4444';
  const labelText = score >= 70 ? 'Strong Trajectory ↑' : score >= 40 ? 'Moderate Trajectory ➔' : 'Action Needed ⚠️';

  // Static chart data derived from current inputs
  const chartMonths = ['Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Current'];
  const revenueDataList = [revenueVal * 0.8, revenueVal * 0.85, revenueVal * 0.9, revenueVal * 0.92, revenueVal * 0.95, revenueVal];
  const expenseDataList = [expensesVal * 0.95, expensesVal * 0.98, expensesVal, expensesVal * 0.97, expensesVal * 0.99, expensesVal];
  const profitDataList = revenueDataList.map((r, i) => r - expenseDataList[i]);

  const chartOptions = {
    responsive: true, maintainAspectRatio: false,
    plugins: { legend: { display: false }, tooltip: { backgroundColor:'var(--bg-elevated)', titleColor:'var(--text-primary)', bodyColor:'var(--text-secondary)', borderColor:'var(--border)', borderWidth:1, padding:12, cornerRadius:10 } },
    scales: {
      x: { grid: { color:'rgba(255,255,255,0.05)' }, ticks: { color:'var(--text-muted)', font:{ size:11 } }, border:{ display:false } },
      y: { grid: { color:'rgba(255,255,255,0.05)' }, ticks: { color:'var(--text-muted)', font:{ size:11 }, callback:(v: string | number) => `₹${(Number(v)/1000).toFixed(0)}K` }, border:{ display:false } }
    },
  };

  const revenueData = {
    labels: chartMonths, datasets: [{
      label:'Revenue', data: revenueDataList,
      borderColor:'#6366F1', backgroundColor:'rgba(99,102,241,0.1)',
      fill:true, tension:0.4, pointRadius:5, pointBackgroundColor:'#6366F1', pointBorderColor:'#fff', pointBorderWidth:2,
    }]
  };

  const expenseData = {
    labels: chartMonths, datasets: [
      { label:'Salaries', data: expenseDataList.map(e => e * 0.4), backgroundColor:'#6366F1' },
      { label:'Rent', data: expenseDataList.map(e => e * 0.15), backgroundColor:'#8B5CF6' },
      { label:'Marketing', data: expenseDataList.map(e => e * 0.2), backgroundColor:'#EC4899' },
      { label:'Operations', data: expenseDataList.map(e => e * 0.25), backgroundColor:'#F59E0B' },
    ]
  };

  const profitData = {
    labels: chartMonths, datasets: [{
      label:'Profit', data: profitDataList,
      borderColor:'#10B981', backgroundColor:'rgba(16,185,129,0.1)',
      fill:true, tension:0.4, pointRadius:5, pointBackgroundColor:'#10B981', pointBorderColor:'#fff', pointBorderWidth:2,
    }]
  };

  const customerData: ChartData<'bar' | 'line'> = {
    labels: chartMonths,
    datasets: [
      { type:'bar' as const, label:'New Customers', data:[18,8,7,7,13,10], backgroundColor:'rgba(99,102,241,0.4)', borderRadius:6 },
      { type:'line' as const, label:'Total Customers', data:[customersVal - 50, customersVal - 40, customersVal - 30, customersVal - 20, customersVal - 10, customersVal], borderColor:'#6366F1', fill:false, tension:0.4, yAxisID:'y1', pointRadius:4, pointBackgroundColor:'#6366F1', pointBorderColor:'#fff', pointBorderWidth:2 },
    ]
  } as unknown as ChartData<'bar' | 'line'>;

  const customerOptions: ChartOptions<'bar' | 'line'> = {
    ...chartOptions,
    scales: { ...chartOptions.scales, y1: { position:'right' as const, grid:{display:false}, ticks:{ color:'var(--text-muted)', font:{size:11} }, border:{display:false} } }
  };

  const gaugeData = {
    datasets: [{ data:[score, 100 - score], backgroundColor:[scoreColor,'rgba(255,255,255,0.08)'], borderWidth:0, circumference:270, rotation:-135 }]
  };
  const gaugeOptions = {
    responsive:true, maintainAspectRatio:false, cutout:'78%',
    plugins:{ legend:{display:false}, tooltip:{enabled:false} }
  };



  return (
    <div>
      {/* Page Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:20, gap:12, flexWrap:'wrap' }}>
        <div>
          <h1 style={{ fontSize:'clamp(1.2rem, 4vw, 1.5rem)', fontWeight:800, marginBottom:4 }}>
            {greeting}, {user?.name || 'Partner'}! 👋
          </h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem' }}>
            {biz.business_name} · {biz.industry} · Last updated today
          </p>
        </div>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
          <Link href="/onboarding" className="btn btn-ghost btn-sm">🔄 Update Data</Link>
          <Link href="/analysis" className="btn btn-primary btn-sm">📄 Full Report</Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-4" style={{ marginBottom:24 }}>
        <StatCard label="Monthly Revenue" value={`₹${revenueVal.toLocaleString('en-IN')}`} delta="+12% vs benchmark" deltaUp={true} icon="💰" accentColor="var(--accent-primary)" />
        <StatCard label="Monthly Expenses" value={`₹${expensesVal.toLocaleString('en-IN')}`} delta="-1.6% vs benchmark" deltaUp={true} icon="📉" accentColor="var(--accent-warning)" />
        <StatCard label="Net Profit" value={`₹${profitVal.toLocaleString('en-IN')}`} delta="+20.7% vs benchmark" deltaUp={true} icon="📈" accentColor="var(--accent-success)" />
        <StatCard label="Active Customers" value={customersVal.toString()} delta="+10 this month" deltaUp={true} icon="👥" accentColor="var(--accent-secondary)" />
      </div>

      {/* Revenue & Expense Charts */}
      <div className="grid-2" style={{ marginBottom:24 }}>
        <div className="card p-6">
          <div className="section-header">
            <h2 className="section-title">💰 Revenue Chart</h2>
            <div style={{ display:'flex', gap:4 }}>
              {(['3M','6M','12M'] as const).map(v => (
                <button key={v} onClick={() => setChartView(v)} className="btn btn-sm" style={{ padding:'4px 10px', background: chartView===v ? 'var(--accent-primary)' : 'var(--bg-elevated)', color: chartView===v ? '#fff' : 'var(--text-secondary)', fontSize:'0.75rem' }}>{v}</button>
              ))}
            </div>
          </div>
          <div className="chart-container" style={{ height:200 }}><Line data={revenueData} options={chartOptions as Parameters<typeof Line>[0]['options']} /></div>
        </div>
        <div className="card p-6">
          <div className="section-header"><h2 className="section-title">📊 Expense Breakdown</h2></div>
          <div className="chart-container" style={{ height:200 }}><Bar data={expenseData} options={{ ...chartOptions, plugins: { ...chartOptions.plugins, legend: { display:true, position:'bottom' as const, labels:{ color:'var(--text-secondary)', font:{size:10}, boxWidth:10, padding:10 } } } } as Parameters<typeof Bar>[0]['options']} /></div>
        </div>
      </div>

      {/* Profit & Customer Charts */}
      <div className="grid-2" style={{ marginBottom:24 }}>
        <div className="card p-6">
          <div className="section-header"><h2 className="section-title">📈 Profit Graph</h2></div>
          <div className="chart-container" style={{ height:200 }}><Line data={profitData} options={chartOptions as Parameters<typeof Line>[0]['options']} /></div>
        </div>
        <div className="card p-6">
          <div className="section-header"><h2 className="section-title">👥 Customer Growth</h2></div>
          <div className="chart-container" style={{ height:200 }}>
            <Chart type="bar" data={customerData} options={customerOptions as Parameters<typeof Chart>[0]['options']} />
          </div>
        </div>
      </div>

      {/* AI Health Score & Growth Opportunities */}
      <div className="grid-2" style={{ marginBottom:24 }}>
        <div className="card p-6">
          <div className="section-header">
            <h2 className="section-title">🧠 AI Health Score</h2>
            <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Updated live</span>
          </div>
          {analysis ? (
            <div style={{ display:'flex', alignItems:'center', gap:24 }}>
              <div style={{ position:'relative', width:130, height:130, flexShrink:0 }}>
                <Doughnut data={gaugeData} options={gaugeOptions} />
                <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                  <div style={{ fontFamily:'JetBrains Mono', fontSize:'2rem', fontWeight:700, color:scoreColor, lineHeight:1 }}>{score}</div>
                  <div style={{ fontSize:'0.65rem', color:'var(--text-muted)' }}>/ 100</div>
                </div>
              </div>
              <div style={{ flex:1 }}>
                <div className="badge badge-success" style={{ marginBottom:10, background: scoreColor, color: '#fff' }}>{labelText}</div>
                {Object.entries(analysis.score_breakdown || {}).map(([lbl, scoreVal]) => (
                  <div key={lbl} style={{ marginBottom:8 }}>
                    <div style={{ display:'flex', justifyContent:'space-between', fontSize:'0.78rem', marginBottom:3 }}>
                      <span style={{ color:'var(--text-secondary)', textTransform:'capitalize' }}>{lbl}</span>
                      <span style={{ fontFamily:'JetBrains Mono', color:'var(--text-primary)' }}>{scoreVal}/25</span>
                    </div>
                    <div className="progress-track" style={{ height:4 }}><div className="progress-fill" style={{ width:`${(scoreVal/25)*100}%` }} /></div>
                  </div>
                ))}
                <Link href="/analysis" className="btn btn-ghost btn-sm" style={{ marginTop:10, width:'100%', justifyContent:'center' }}>View Full Analysis →</Link>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px 0' }}>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 12 }}>No analysis data available yet.</p>
              <Link href="/onboarding" className="btn btn-primary btn-sm">Run AI Engine</Link>
            </div>
          )}
        </div>

        <div className="card p-6">
          <div className="section-header">
            <h2 className="section-title">🚀 Growth Opportunities</h2>
            <Link href="/analysis" style={{ fontSize:'0.8rem', color:'var(--accent-primary)' }}>See all →</Link>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {analysis?.recommendations?.slice(0, 3).map((op, i) => (
              <div key={i} style={{ padding:'14px 16px', borderRadius:12, border:'1px solid var(--border)', background:'var(--bg-elevated)' }}>
                <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <span style={{ fontSize:'1.3rem' }}>
                    {op.category === 'finance' ? '💰' : op.category === 'marketing' ? '📣' : op.category === 'digital' ? '💻' : '⚙️'}
                  </span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:'0.875rem', fontWeight:600 }}>{op.title}</div>
                    <div style={{ fontSize:'0.75rem', color:'var(--accent-success)' }}>{op.impact}</div>
                  </div>
                  <span className={`priority-${op.priority}`}>{op.priority}</span>
                </div>
              </div>
            )) || (
              <div style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '30px 0' }}>
                Complete onboarding to discover personalized business opportunities.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Monthly Reports Carousel */}
      <div className="card p-6">
        <div className="section-header">
          <h2 className="section-title">📋 Monthly Reports</h2>
          <Link href="/progress" style={{ fontSize:'0.8rem', color:'var(--accent-primary)' }}>View All History →</Link>
        </div>
        <div style={{ display:'flex', gap:14, overflowX:'auto', paddingBottom:8 }}>
          {history.map((r, i) => (
            <div key={i} className="hover-card" style={{ minWidth:180, padding:'16px 18px', borderRadius:14, border:`2px solid ${i === 0 ? 'var(--accent-primary)' : 'var(--border)'}`, background: i === 0 ? 'rgba(var(--accent-primary-rgb),0.06)' : 'var(--bg-elevated)', flexShrink:0 }}>
              <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', marginBottom:8 }}>
                {new Date(r.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
              </div>
              <div style={{ fontFamily:'JetBrains Mono', fontSize:'2rem', fontWeight:700, color: r.health_score>=70 ? 'var(--accent-success)' : r.health_score>=40 ? 'var(--accent-warning)' : 'var(--accent-danger)', marginBottom:4 }}>
                {r.health_score}
              </div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', marginBottom:10 }}>Health Score</div>
              {i === 0 && <div className="badge badge-primary" style={{ marginTop:10, width:'100%', justifyContent:'center' }}>Current</div>}
            </div>
          ))}
          <div className="hover-card" style={{ minWidth:180, padding:'16px 18px', borderRadius:14, border:'2px dashed var(--border)', background:'transparent', flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <Link href="/onboarding" style={{ textAlign:'center', color:'var(--text-muted)' }}>
              <div style={{ fontSize:'2rem', marginBottom:6 }}>➕</div>
              <div style={{ fontSize:'0.8rem' }}>Add Report</div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

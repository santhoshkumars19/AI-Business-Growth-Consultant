'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

interface Recommendation {
  title: string;
  description: string;
  impact: string;
  priority: 'high' | 'medium' | 'quick';
  category: string;
  steps?: string[];
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
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  seo_tips: { tip: string; impact: string }[];
  competitor_insights: {
    market_position: string;
    key_gaps: string[];
    advantages: string[];
  };
  budget_allocation: Record<string, number>;
  summary: string;
  created_at: string;
}

function MiniBarChart({ data, months }: { data: number[], months: string[] }) {
  const max = Math.max(...data, 1);
  return (
    <div style={{ display: 'flex', gap: 6, alignItems: 'flex-end', height: 80 }}>
      {data.map((v, i) => (
        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ width: '100%', height: `${(v / max) * 100}%`, background: i === data.length - 1 ? 'var(--accent-primary)' : 'rgba(var(--accent-primary-rgb),0.3)', borderRadius: '3px 3px 0 0', transition: 'height 0.8s ease' }} />
          <div style={{ fontSize: '0.6rem', color: 'var(--text-muted)' }}>{months[i]}</div>
        </div>
      ))}
    </div>
  );
}

export default function AnalysisPage() {
  const { user, fetchWithAuth } = useAuth();
  const [analysis, setAnalysis] = useState<AnalysisData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRec, setExpandedRec] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const biz = user?.businessData;
  const profit = biz ? biz.monthly_revenue - biz.monthly_expenses : 0;
  const margin = biz ? Math.round((profit / biz.monthly_revenue) * 100) : 0;

  useEffect(() => {
    const loadAnalysis = async () => {
      try {
        const data = await fetchWithAuth('/analysis/latest');
        setAnalysis(data);
      } catch (err: any) {
        console.error('Failed to load analysis:', err);
        setError(err.message || 'Failed to retrieve analysis reports');
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadAnalysis();
    }
  }, [user]);

  const handleDownloadPDF = async () => {
    if (isDownloading) return;
    setIsDownloading(true);
    try {
      const blob = await fetchWithAuth('/reports/pdf', { method: 'POST' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GrowthIQ_Report_${biz?.business_name || 'business'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } catch (err: any) {
      alert(`PDF Download failed: ${err.message || err}`);
    } finally {
      setIsDownloading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 20 }}>
        <div style={{ width: 50, height: 50, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading latest analysis report...</p>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24, textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 20 }}>⚠️</div>
        <h2 style={{ fontFamily: 'Outfit', fontSize: '1.75rem', fontWeight: 800, marginBottom: 10 }}>No Analysis Found</h2>
        <p style={{ color: 'var(--text-secondary)', maxWidth: 450, marginBottom: 24 }}>
          {error || "We couldn't retrieve an analysis for your business. Please complete the setup onboarding first."}
        </p>
        <Link href="/onboarding" className="btn btn-primary btn-lg">Start Onboarding Setup</Link>
      </div>
    );
  }

  const scoreColor = analysis.health_score >= 70 ? 'var(--accent-success)' : analysis.health_score >= 40 ? 'var(--accent-warning)' : 'var(--accent-danger)';
  const label = analysis.health_score >= 70 ? 'Strong Growth Trajectory' : analysis.health_score >= 40 ? 'Moderate Growth Trajectory' : 'Critical Action Required';

  // Generate dummy chart points for display
  const months = ['Current'];
  const revenueTrend = [biz?.monthly_revenue || 0];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Top bar */}
      <div style={{ background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>⚡</div>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem' }}>GrowthIQ <span style={{ color: 'var(--accent-primary)' }}>AI</span></span>
          <span style={{ color: 'var(--border)', margin: '0 6px' }}>|</span>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>AI Analysis Report</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/dashboard" className="btn btn-primary btn-sm">Go to Dashboard →</Link>
        </div>
      </div>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        {/* Hero Score */}
        <div className="card" style={{ padding: '36px 40px', marginBottom: 28, background: 'var(--gradient-card)', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', top: -60, right: -60, width: 200, height: 200, borderRadius: '50%', background: 'rgba(var(--accent-primary-rgb),0.08)' }} />
          <div className="badge badge-primary" style={{ marginBottom: 16 }}>📊 Analysis Complete — {new Date(analysis.created_at || Date.now()).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>{biz?.business_name || 'Your Business'} — AI Analysis</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 28 }}>{biz?.industry || 'Business'} · {biz?.city || 'Tamil Nadu'}, {biz?.state || 'India'}</p>
          <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ fontFamily: 'JetBrains Mono', fontSize: '5rem', fontWeight: 700, color: scoreColor, lineHeight: 1 }}>{analysis.health_score}</div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>out of 100</div>
            <div className="badge badge-success" style={{ marginTop: 10 }}>{label}</div>
          </div>
          <p style={{ color: 'var(--text-secondary)', maxWidth: 650, margin: '0 auto 24px', lineHeight: 1.6 }}>{analysis.summary}</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, maxWidth: 640, margin: '0 auto' }}>
            {[
              ['💰','Revenue',`₹${((biz?.monthly_revenue||0)/1000).toFixed(0)}K`,'success'],
              ['📈','Profit Margin',`${margin}%`,'primary'],
              ['👥','Customers',biz?.monthly_customers||0,'primary'],
              ['👤','Employees',biz?.employee_count||1,'muted'],
            ].map(([icon,label,val,c]) => (
              <div key={String(label)} style={{ background: 'var(--bg-surface)', borderRadius: 12, padding: '12px 16px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.25rem', marginBottom: 4 }}>{icon}</div>
                <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: '1.1rem', color: `var(--accent-${c})` }}>{val}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Analysis Grid */}
        <div className="grid-2" style={{ marginBottom: 28 }}>
          {/* Revenue Growth */}
          <div className="card p-6">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>📈 Metric Summary</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Monthly Expenses</span>
                <span style={{ fontFamily: 'JetBrains Mono' }}>₹{biz?.monthly_expenses?.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Avg Order Value</span>
                <span style={{ fontFamily: 'JetBrains Mono' }}>₹{biz?.avg_order_value?.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--text-secondary)' }}>Online Presence</span>
                <span style={{ textTransform: 'capitalize' }}>{biz?.online_presence}</span>
              </div>
            </div>
          </div>
          
          {/* Health Score breakdown */}
          <div className="card p-6">
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>🎯 Score Breakdown</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {Object.entries(analysis.score_breakdown || {}).map(([key, val]) => (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: '0.8rem', textTransform: 'capitalize' }}>{key}</span>
                    <span style={{ fontSize: '0.8rem', fontFamily: 'JetBrains Mono', color: 'var(--accent-primary)' }}>{val}/25</span>
                  </div>
                  <div className="progress-track" style={{ height: 5 }}>
                    <div className="progress-fill" style={{ width: `${(val/25)*100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SWOT Overview */}
          <div className="card p-6" style={{ gridColumn: 'span 2' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 16 }}>💪 SWOT Analysis</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div>
                <h4 style={{ color: 'var(--accent-success)', fontSize: '0.9rem', fontWeight: 700, marginBottom: 8 }}>Strengths</h4>
                <ul style={{ paddingLeft: 16, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {analysis.swot?.strengths?.map((s, i) => <li key={i}>{s}</li>)}
                </ul>
              </div>
              <div>
                <h4 style={{ color: 'var(--accent-danger)', fontSize: '0.9rem', fontWeight: 700, marginBottom: 8 }}>Weaknesses</h4>
                <ul style={{ paddingLeft: 16, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {analysis.swot?.weaknesses?.map((w, i) => <li key={i}>{w}</li>)}
                </ul>
              </div>
              <div>
                <h4 style={{ color: 'var(--accent-primary)', fontSize: '0.9rem', fontWeight: 700, marginBottom: 8 }}>Opportunities</h4>
                <ul style={{ paddingLeft: 16, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {analysis.swot?.opportunities?.map((o, i) => <li key={i}>{o}</li>)}
                </ul>
              </div>
              <div>
                <h4 style={{ color: 'var(--accent-warning)', fontSize: '0.9rem', fontWeight: 700, marginBottom: 8 }}>Threats</h4>
                <ul style={{ paddingLeft: 16, fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {analysis.swot?.threats?.map((t, i) => <li key={i}>{t}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Recommendations */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.75rem', fontWeight: 800, marginBottom: 8 }}>🎯 Your AI-Powered Growth Plan</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Actionable data-backed recommendations specific to {biz?.business_name || 'your business'}</p>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {analysis.recommendations?.map((rec, idx) => (
              <div key={idx} className={`rec-card ${rec.priority}`} onClick={() => setExpandedRec(expandedRec === idx ? null : idx)} style={{ cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                  <div style={{ fontSize: '1.75rem', lineHeight: 1 }}>
                    {rec.category === 'finance' ? '💰' : rec.category === 'marketing' ? '📣' : rec.category === 'digital' ? '💻' : '⚙️'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>{rec.title}</h3>
                      <span className={`priority-${rec.priority}`}>
                        {rec.priority === 'high' ? '🔴 High Priority' : rec.priority === 'medium' ? '🟡 Medium' : '🟢 Quick Win'}
                      </span>
                      <span style={{ marginLeft: 'auto', fontSize: '0.8rem', color: 'var(--accent-success)', fontWeight: 600, background: 'rgba(var(--accent-success-rgb),0.1)', padding: '2px 10px', borderRadius: 99 }}>{rec.impact}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{rec.description}</p>
                  </div>
                  <div style={{ fontSize: '1rem', color: 'var(--text-muted)', flexShrink: 0, transition: 'transform 0.3s ease', transform: expandedRec === idx ? 'rotate(180deg)' : 'none' }}>▼</div>
                </div>
                {expandedRec === idx && (
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid var(--border)', animation: 'fadeIn 0.3s ease' }}>
                    <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 10 }}>📋 Category Focus: <span style={{ textTransform: 'capitalize', color: 'var(--accent-primary)' }}>{rec.category}</span></p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-primary)', color: '#fff', fontSize: '0.7rem', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2 }}>✓</div>
                        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                          Begin implementing this recommendation by dedicating at least 15 minutes of operational review to this area this week.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/dashboard" className="btn btn-primary btn-xl">🏠 Go to My Dashboard →</Link>
          <button className="btn btn-ghost btn-xl" onClick={handleDownloadPDF} disabled={isDownloading}>
            {isDownloading ? '⏳ Generating PDF...' : '📄 Download PDF Report'}
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

/* ─── Types ───────────────────────────────────────────── */
interface Recommendation {
  title: string;
  description: string;
  impact: string;
  priority: 'high' | 'medium' | 'quick';
  category: string;
}
interface AnalysisData {
  health_score: number;
  score_breakdown: Record<string, number>;
  recommendations: Recommendation[];
  swot: { strengths: string[]; weaknesses: string[]; opportunities: string[]; threats: string[] };
  seo_tips: { tip: string; impact: string }[];
  competitor_insights: { market_position: string; key_gaps: string[]; advantages: string[] };
  marketing_plan: { week: number; strategy: string; tactics: string[] }[];
  summary: string;
  created_at: string;
}

/* ─── Colour helpers ───────────────────────────────────── */
const scoreColor = (s: number) => s >= 70 ? '#10B981' : s >= 40 ? '#F59E0B' : '#EF4444';
const barColor   = '#6366F1';

/* ─── PDF Content Component (hidden, white background) ─── */
function PdfContent({ user, analysis }: { user: any; analysis: AnalysisData }) {
  const biz  = user?.businessData;
  const date = new Date(analysis.created_at || Date.now()).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' });
  const profit = biz ? biz.monthly_revenue - biz.monthly_expenses : 0;
  const margin = biz && biz.monthly_revenue > 0 ? Math.round((profit / biz.monthly_revenue) * 100) : 0;
  const sc = scoreColor(analysis.health_score);

  const cell = (label: string, value: string, color = '#374151') => (
    <div style={{ background:'#F8FAFC', borderRadius:8, padding:'10px 14px', border:'1px solid #E2E8F0' }}>
      <div style={{ fontSize:10, color:'#9CA3AF', textTransform:'uppercase', letterSpacing:'0.06em', marginBottom:3 }}>{label}</div>
      <div style={{ fontWeight:700, fontSize:14, color }}>{value}</div>
    </div>
  );

  const progressBar = (label: string, val: number, max = 25) => (
    <div style={{ marginBottom:8 }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:3 }}>
        <span style={{ fontSize:11, color:'#374151', textTransform:'capitalize' }}>{label}</span>
        <span style={{ fontSize:11, fontWeight:700, color:barColor }}>{val}/{max}</span>
      </div>
      <div style={{ height:6, background:'#E2E8F0', borderRadius:3, overflow:'hidden' }}>
        <div style={{ height:'100%', width:`${(val/max)*100}%`, background:`linear-gradient(90deg, ${barColor}, #818CF8)`, borderRadius:3 }} />
      </div>
    </div>
  );

  const swotBox = (title: string, items: string[], bg: string, border: string, tc: string) => (
    <div style={{ background:bg, border:`1.5px solid ${border}`, borderRadius:10, padding:'12px 14px', flex:'1 1 45%', minWidth:180 }}>
      <div style={{ fontWeight:700, fontSize:11, color:tc, marginBottom:8, textTransform:'uppercase', letterSpacing:'0.05em' }}>{title}</div>
      <ul style={{ paddingLeft:14, margin:0, display:'flex', flexDirection:'column', gap:4 }}>
        {items?.map((it, i) => <li key={i} style={{ fontSize:10.5, color:'#374151', lineHeight:1.5 }}>{it}</li>)}
      </ul>
    </div>
  );

  const sectionTitle = (text: string, sub?: string) => (
    <div style={{ marginBottom:14 }}>
      <h2 style={{ fontFamily:'Georgia, serif', fontSize:16, fontWeight:700, color:'#1E293B', borderLeft:'4px solid #6366F1', paddingLeft:10, margin:'0 0 4px 0' }}>{text}</h2>
      {sub && <p style={{ fontSize:11, color:'#6B7280', margin:'0 0 0 14px' }}>{sub}</p>}
    </div>
  );

  return (
    <div id="pdf-content" style={{ width:794, background:'#FFFFFF', color:'#1E293B', fontFamily:'Arial, Helvetica, sans-serif', padding:0, margin:0 }}>

      {/* ── Cover Page ─────────────────────────────── */}
      <div style={{ minHeight:1123, background:'#FFFFFF', display:'flex', flexDirection:'column', padding:'60px 56px', boxSizing:'border-box', position:'relative', overflow:'hidden', borderBottom:'1px solid #E2E8F0' }}>

        <div style={{ marginBottom:'auto' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:60 }}>
            <div style={{ width:36, height:36, borderRadius:9, background:'rgba(99,102,241,0.08)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:18, color:'#6366F1', fontWeight:'bold' }}>■</div>
            <span style={{ color:'#6366F1', fontWeight:800, fontSize:16, letterSpacing:'0.02em' }}>GrowthIQ AI</span>
          </div>
          <div style={{ display:'inline-block', background:'rgba(99,102,241,0.08)', border:'1px solid rgba(99,102,241,0.2)', borderRadius:99, padding:'5px 16px', fontSize:11, color:'#6366F1', fontWeight:600, marginBottom:20, letterSpacing:'0.06em' }}>BUSINESS ANALYSIS REPORT</div>
          <h1 style={{ fontFamily:'Georgia, serif', fontSize:34, fontWeight:700, color:'#0F172A', lineHeight:1.25, margin:'0 0 12px 0' }}>
            {biz?.business_name || 'Your Business'}<br />
            <span style={{ fontWeight:400, fontSize:22, color:'#6366F1' }}>Growth Intelligence Report</span>
          </h1>
          <p style={{ color:'#64748B', fontSize:13, margin:'0 0 40px 0' }}>
            {biz?.industry} · {biz?.city}, {biz?.state} · Generated {date}
          </p>
        </div>

        {/* Health Score on cover */}
        <div style={{ display:'flex', alignItems:'center', gap:32, background:'#F8FAFC', borderRadius:16, padding:'24px 32px', border:'1px solid #E2E8F0' }}>
          <div style={{ textAlign:'center' }}>
            <div style={{ fontFamily:'monospace', fontSize:52, fontWeight:800, color:sc, lineHeight:1 }}>{analysis.health_score}</div>
            <div style={{ fontSize:11, color:'#64748B', marginTop:4 }}>Health Score / 100</div>
          </div>
          <div style={{ width:1, height:70, background:'#E2E8F0' }} />
          <div style={{ display:'flex', flexDirection:'column', gap:10, flex:1 }}>
            {[
              ['Monthly Revenue', `₹${(biz?.monthly_revenue||0).toLocaleString('en-IN')}`],
              ['Net Profit Margin', `${margin}%`],
              ['Active Customers', `${biz?.monthly_customers||0}`],
              ['Team Size', `${biz?.employee_count||1} employees`],
            ].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', fontSize:12 }}>
                <span style={{ color:'#64748B' }}>{k}</span>
                <span style={{ color:'#0F172A', fontWeight:700 }}>{v}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ marginTop:40, fontSize:10, color:'#94A3B8', textAlign:'center' }}>
          Confidential · Powered by Gemini AI · GrowthIQ AI Platform · {new Date().getFullYear()}
        </div>
      </div>

      {/* ── Page 2: Summary + Score Breakdown ──────── */}
      <div style={{ padding:'48px 56px', boxSizing:'border-box', minHeight:1123 }}>
        {sectionTitle('Executive Summary', 'AI-generated overview of your business performance')}
        <p style={{ fontSize:12, color:'#374151', lineHeight:1.8, background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:10, padding:'16px 20px', marginBottom:28 }}>
          {analysis.summary || 'No summary available.'}
        </p>

        {sectionTitle('Business Health Score', 'Performance across 4 key business dimensions')}
        <div style={{ display:'flex', alignItems:'center', gap:40, marginBottom:32, background:'#F8FAFC', borderRadius:14, padding:'24px 28px', border:'1px solid #E2E8F0' }}>
          <div style={{ textAlign:'center', flexShrink:0 }}>
            <div style={{ fontFamily:'monospace', fontSize:56, fontWeight:800, color:sc, lineHeight:1 }}>{analysis.health_score}</div>
            <div style={{ fontSize:10, color:'#9CA3AF', marginTop:4 }}>OUT OF 100</div>
            <div style={{ marginTop:8, padding:'4px 12px', background:`${sc}20`, color:sc, borderRadius:99, fontSize:10, fontWeight:700 }}>
              {analysis.health_score >= 70 ? 'STRONG' : analysis.health_score >= 40 ? 'MODERATE' : 'CRITICAL'}
            </div>
          </div>
          <div style={{ flex:1 }}>
            {Object.entries(analysis.score_breakdown || {}).map(([k, v]) => progressBar(k, v as number))}
          </div>
        </div>

        {sectionTitle('Key Business Metrics')}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:12, marginBottom:28 }}>
          {cell('Monthly Revenue', `₹${(biz?.monthly_revenue||0).toLocaleString('en-IN')}`, '#10B981')}
          {cell('Monthly Expenses', `₹${(biz?.monthly_expenses||0).toLocaleString('en-IN')}`, '#F59E0B')}
          {cell('Net Profit', `₹${profit.toLocaleString('en-IN')}`, profit >= 0 ? '#10B981' : '#EF4444')}
          {cell('Profit Margin', `${margin}%`, margin >= 20 ? '#10B981' : margin >= 0 ? '#F59E0B' : '#EF4444')}
          {cell('Customers/Month', `${biz?.monthly_customers||0}`, '#6366F1')}
          {cell('Avg Order Value', `₹${(biz?.avg_order_value||0).toLocaleString('en-IN')}`, '#6366F1')}
          {cell('Employees', `${biz?.employee_count||1}`, '#374151')}
          {cell('Online Presence', biz?.online_presence || 'None', '#374151')}
        </div>
      </div>

      {/* ── Page 3: SWOT ────────────────────────────── */}
      <div style={{ padding:'48px 56px', boxSizing:'border-box', minHeight:1123 }}>
        {sectionTitle('SWOT Analysis', 'Strengths, Weaknesses, Opportunities & Threats')}
        <div style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:28 }}>
          {swotBox('💪 Strengths',    analysis.swot?.strengths || [],    '#F0FDF4','#86EFAC','#16A34A')}
          {swotBox('⚠️ Weaknesses',  analysis.swot?.weaknesses || [],   '#FFF1F2','#FCA5A5','#DC2626')}
          {swotBox('🚀 Opportunities',analysis.swot?.opportunities || [],'#EFF6FF','#93C5FD','#2563EB')}
          {swotBox('🛡️ Threats',      analysis.swot?.threats || [],      '#FFFBEB','#FCD34D','#D97706')}
        </div>

        {/* AI Recommendations */}
        {sectionTitle('AI-Powered Recommendations', 'Data-backed growth actions for your business')}
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          {(analysis.recommendations || []).map((rec, i) => (
            <div key={i} style={{ background:'#F8FAFC', borderRadius:10, padding:'14px 16px', border:`1.5px solid ${rec.priority==='high'?'#FCA5A5':rec.priority==='medium'?'#FCD34D':'#86EFAC'}`, borderLeft:`4px solid ${rec.priority==='high'?'#EF4444':rec.priority==='medium'?'#F59E0B':'#10B981'}` }}>
              <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                <span style={{ fontSize:11, fontWeight:700, color: rec.priority==='high'?'#EF4444':rec.priority==='medium'?'#F59E0B':'#10B981', background: rec.priority==='high'?'#FFF1F2':rec.priority==='medium'?'#FFFBEB':'#F0FDF4', padding:'2px 8px', borderRadius:99, textTransform:'uppercase' }}>
                  {rec.priority === 'high' ? '🔴 High Priority' : rec.priority === 'medium' ? '🟡 Medium' : '🟢 Quick Win'}
                </span>
                <span style={{ fontSize:10, color:'#6B7280', background:'#F1F5F9', padding:'2px 8px', borderRadius:99, textTransform:'capitalize' }}>{rec.category}</span>
                {rec.impact && <span style={{ fontSize:10, color:'#10B981', background:'#F0FDF4', padding:'2px 8px', borderRadius:99, marginLeft:'auto' }}>{rec.impact}</span>}
              </div>
              <div style={{ fontWeight:700, fontSize:12, color:'#1E293B', marginBottom:4 }}>{rec.title}</div>
              <div style={{ fontSize:11, color:'#6B7280', lineHeight:1.6 }}>{rec.description}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Page 4: SEO + Competitor + Marketing ──── */}
      <div style={{ padding:'48px 56px', boxSizing:'border-box', minHeight:1123 }}>
        {/* SEO Audit */}
        {analysis.seo_tips?.length > 0 && (
          <>
            {sectionTitle('SEO Audit', 'Search engine optimisation recommendations')}
            <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom:28 }}>
              {analysis.seo_tips.slice(0,6).map((s, i) => (
                <div key={i} style={{ display:'flex', gap:12, padding:'10px 14px', background:'#F8FAFC', borderRadius:8, border:'1px solid #E2E8F0' }}>
                  <div style={{ width:22, height:22, borderRadius:'50%', background:'#6366F1', color:'#fff', fontSize:10, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, marginTop:1 }}>{i+1}</div>
                  <div>
                    <div style={{ fontSize:11.5, fontWeight:600, color:'#1E293B', marginBottom:2 }}>{s.tip}</div>
                    {s.impact && <div style={{ fontSize:10, color:'#6B7280' }}>Impact: {s.impact}</div>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Competitor Insights */}
        {analysis.competitor_insights && (
          <>
            {sectionTitle('Competitor Analysis', 'Market positioning and competitive intelligence')}
            <div style={{ background:'#F8FAFC', borderRadius:12, padding:'18px 20px', border:'1px solid #E2E8F0', marginBottom:28 }}>
              <div style={{ fontWeight:700, fontSize:12, color:'#1E293B', marginBottom:8 }}>Market Position</div>
              <p style={{ fontSize:11.5, color:'#374151', lineHeight:1.7, marginBottom:14 }}>{analysis.competitor_insights.market_position}</p>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                <div>
                  <div style={{ fontWeight:700, fontSize:11, color:'#16A34A', marginBottom:6 }}>✅ Your Advantages</div>
                  {analysis.competitor_insights.advantages?.map((a, i) => (
                    <div key={i} style={{ fontSize:10.5, color:'#374151', padding:'3px 0', borderBottom:'1px solid #F1F5F9' }}>• {a}</div>
                  ))}
                </div>
                <div>
                  <div style={{ fontWeight:700, fontSize:11, color:'#DC2626', marginBottom:6 }}>⚠️ Key Gaps</div>
                  {analysis.competitor_insights.key_gaps?.map((g, i) => (
                    <div key={i} style={{ fontSize:10.5, color:'#374151', padding:'3px 0', borderBottom:'1px solid #F1F5F9' }}>• {g}</div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}

        {/* Marketing Plan */}
        {analysis.marketing_plan?.length > 0 && (
          <>
            {sectionTitle('30-Day Marketing Plan', 'Week-by-week growth strategy')}
            <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
              {analysis.marketing_plan.slice(0,4).map((week, i) => (
                <div key={i} style={{ background:'#F8FAFC', borderRadius:10, padding:'12px 16px', border:'1px solid #E2E8F0', borderLeft:`4px solid ${barColor}` }}>
                  <div style={{ fontWeight:700, fontSize:12, color:'#1E293B', marginBottom:4 }}>Week {week.week}: {week.strategy}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                    {week.tactics?.map((t, ti) => (
                      <span key={ti} style={{ fontSize:10, color:'#6366F1', background:'#EEF2FF', padding:'2px 8px', borderRadius:99 }}>• {t}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

    </div>
  );
}

/* ─── Main Page ────────────────────────────────────────── */
const sections = [
  { id:'score',       label:'Business Health Score',   icon:'🧠', included:true  },
  { id:'revenue',     label:'Revenue & Expense Charts', icon:'💰', included:true  },
  { id:'recommendations', label:'AI Recommendations',  icon:'🎯', included:true  },
  { id:'swot',        label:'SWOT Analysis',            icon:'📋', included:true  },
  { id:'marketing',   label:'30-Day Marketing Plan',    icon:'📅', included:true  },
  { id:'competitor',  label:'Competitor Analysis',      icon:'⚔️', included:true  },
  { id:'seo',         label:'SEO Audit Results',        icon:'🔎', included:true  },
];

export default function PdfExportPage() {
  const { user, fetchWithAuth } = useAuth();
  const [selected, setSelected] = useState(sections.map(s => ({ ...s })));
  const [generating, setGenerating]  = useState(false);
  const [analysis, setAnalysis]      = useState<AnalysisData | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [status, setStatus]          = useState('');
  const pdfRef = useRef<HTMLDivElement>(null);

  const toggle  = (id: string) => setSelected(prev => prev.map(s => s.id === id ? { ...s, included: !s.included } : s));
  const included = selected.filter(s => s.included).length;

  /* Load analysis data on mount */
  useEffect(() => {
    fetchWithAuth('/analysis/latest')
      .then((data: AnalysisData) => setAnalysis(data))
      .catch(() => setAnalysis(null))
      .finally(() => setLoadingData(false));
  }, []);

  /* ── Core PDF generator ─────────────────────────────── */
  const generate = async () => {
    if (!analysis) { alert('No analysis data found. Please run AI analysis first from the dashboard.'); return; }
    setGenerating(true);
    setStatus('Preparing document...');

    try {
      // Dynamic import so these heavy libs don't affect initial page load
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import('html2canvas'),
        import('jspdf'),
      ]);

      const el = pdfRef.current;
      if (!el) throw new Error('PDF content element not found');

      // Make the hidden container visible for capture
      el.style.display = 'block';

      // Wait one frame for layout + fonts to settle
      await new Promise(r => setTimeout(r, 400));
      setStatus('Rendering pages...');

      const A4_W = 794;
      const A4_H = 1123;

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: A4_W,
        windowWidth: A4_W,
        logging: false,
        onclone: (doc) => {
          // Ensure all no-print elements are hidden inside the cloned doc
          doc.querySelectorAll('.no-print').forEach((n: any) => { n.style.display = 'none'; });
        },
      });

      // Hide again immediately after capture
      el.style.display = 'none';

      setStatus('Building PDF...');

      const pdf = new jsPDF({ unit: 'px', format: [A4_W, A4_H], orientation: 'portrait', compress: true });

      const imgW  = A4_W;
      const imgH  = (canvas.height / canvas.width) * imgW;
      const imgData = canvas.toDataURL('image/jpeg', 0.95);

      // Slice the long canvas image into A4 pages
      const totalPages = Math.ceil(imgH / A4_H);
      for (let page = 0; page < totalPages; page++) {
        if (page > 0) pdf.addPage([A4_W, A4_H], 'portrait');
        const srcY  = page * A4_H * (canvas.width / imgW);
        const srcH  = Math.min(A4_H * (canvas.width / imgW), canvas.height - srcY);
        const slice = document.createElement('canvas');
        slice.width  = canvas.width;
        slice.height = srcH;
        const ctx = slice.getContext('2d')!;
        ctx.drawImage(canvas, 0, srcY, canvas.width, srcH, 0, 0, canvas.width, srcH);
        const sliceData = slice.toDataURL('image/jpeg', 0.95);
        const renderedH = (srcH / canvas.width) * imgW;
        pdf.addImage(sliceData, 'JPEG', 0, 0, imgW, renderedH, '', 'FAST');
      }

      setStatus('Downloading...');
      const bizName = (user?.businessData?.business_name || 'Business').replace(/\s+/g, '_');
      const filename = `GrowthIQ_Report_${bizName}_${new Date().toISOString().slice(0,10)}.pdf`;

      // Use Blob-URL download to prevent mobile browsers from triggering "Open PDF?" navigation popups
      const blob = pdf.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);

    } catch (err: any) {
      console.error('PDF generation error:', err);
      alert(`PDF generation failed: ${err.message || 'Unknown error'}. Please try again.`);
    } finally {
      // Always hide the pdf div and clear status
      if (pdfRef.current) pdfRef.current.style.display = 'none';
      setGenerating(false);
      setStatus('');
    }
  };

  return (
    <div>
      {/* ── Hidden PDF render target (off-screen, never shown to user) ── */}
      <div
        ref={pdfRef}
        style={{
          display: 'none',
          position: 'fixed',
          top: 0,
          left: '-9999px',
          zIndex: -1,
          width: 794,
          background: '#fff',
          pointerEvents: 'none',
        }}
        aria-hidden="true"
      >
        {analysis && <PdfContent user={user} analysis={analysis} />}
      </div>

      {/* ── Visible UI ─────────────────────────────────── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 'clamp(1.2rem, 4vw, 1.5rem)', fontWeight: 800, marginBottom: 4 }}>📄 Download PDF Report</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Generate a professional business analysis PDF — instantly downloaded to your device.
        </p>
      </div>

      <div className="grid-2" style={{ alignItems: 'start' }}>
        {/* Left: Section selector */}
        <div className="card p-6">
          <h2 style={{ fontWeight: 700, marginBottom: 16, fontSize: '1rem' }}>📋 Select Sections</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 24 }}>
            {selected.map(s => (
              <label key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', borderRadius: 10, border: `1px solid ${s.included ? 'var(--accent-primary)' : 'var(--border)'}`, background: s.included ? 'rgba(var(--accent-primary-rgb),0.06)' : 'var(--bg-elevated)', cursor: 'pointer', transition: 'all 0.15s ease', userSelect: 'none' }}>
                <input type="checkbox" checked={s.included} onChange={() => toggle(s.id)} style={{ accentColor: 'var(--accent-primary)', width: 15, height: 15, flexShrink: 0 }} />
                <span style={{ fontSize: '1.05rem' }}>{s.icon}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: s.included ? 600 : 400 }}>{s.label}</span>
              </label>
            ))}
          </div>

          {loadingData ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-muted)', fontSize: '0.85rem', padding: '12px 0' }}>
              <div style={{ width: 16, height: 16, borderRadius: '50%', border: '2px solid var(--border)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
              Loading analysis data...
            </div>
          ) : !analysis ? (
            <div style={{ background: 'rgba(var(--accent-danger-rgb),0.08)', border: '1px solid var(--accent-danger)', borderRadius: 10, padding: '12px 14px', fontSize: '0.85rem', color: 'var(--accent-danger)' }}>
              ⚠️ No analysis data found. Please <Link href="/onboarding" className="link">run AI analysis</Link> first.
            </div>
          ) : (
            <div style={{ background: 'rgba(var(--accent-success-rgb),0.08)', border: '1px solid var(--accent-success)', borderRadius: 10, padding: '12px 14px', fontSize: '0.85rem', color: 'var(--accent-success)' }}>
              ✅ Analysis data loaded — {analysis.recommendations?.length || 0} recommendations ready
            </div>
          )}
        </div>

        {/* Right: Preview + Generate */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Preview thumbnail */}
          <div className="card p-6">
            <h2 style={{ fontWeight: 700, marginBottom: 14, fontSize: '1rem' }}>👁️ Report Preview</h2>
            <div style={{ background: 'white', borderRadius: 12, padding: 18, border: '1px solid var(--border)', color: '#0F172A' }}>
              {/* Cover thumbnail mockup */}
              <div style={{ background: 'linear-gradient(135deg, #6366F1, #7C3AED)', borderRadius: 8, padding: '14px 16px', marginBottom: 12 }}>
                <div style={{ fontFamily: 'Outfit, sans-serif', fontWeight: 800, fontSize: '0.9rem', color: '#fff' }}>GrowthIQ AI</div>
                <div style={{ fontSize: '0.65rem', color: 'rgba(255,255,255,0.7)', marginTop: 2 }}>
                  {user?.businessData?.business_name || 'Your Business'} — Analysis Report
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                  <div style={{ fontFamily: 'monospace', fontWeight: 800, fontSize: '1.5rem', color: '#fff' }}>
                    {analysis?.health_score ?? '—'}
                  </div>
                  <div style={{ fontSize: '0.6rem', color: 'rgba(255,255,255,0.6)' }}>Health Score</div>
                </div>
              </div>
              {selected.filter(s => s.included).slice(0, 5).map(s => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '5px 0', borderBottom: '1px solid #F1F5F9' }}>
                  <span style={{ fontSize: '0.8rem' }}>{s.icon}</span>
                  <div style={{ flex: 1, height: 7, background: '#F1F5F9', borderRadius: 4 }} />
                </div>
              ))}
              {included > 5 && <div style={{ textAlign: 'center', fontSize: '0.65rem', color: '#6B7280', marginTop: 8 }}>+{included - 5} more sections...</div>}
            </div>
          </div>

          {/* Stats */}
          <div className="card p-5">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ textAlign: 'center', padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 10 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.4rem', color: 'var(--accent-primary)' }}>{included}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Sections</div>
              </div>
              <div style={{ textAlign: 'center', padding: '10px 12px', background: 'var(--bg-elevated)', borderRadius: 10 }}>
                <div style={{ fontFamily: 'JetBrains Mono, monospace', fontWeight: 700, fontSize: '1.4rem', color: 'var(--accent-success)' }}>4–6</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Est. pages</div>
              </div>
            </div>
          </div>

          {/* Generate button */}
          <button
            className="btn btn-primary btn-xl no-print"
            style={{ width: '100%', justifyContent: 'center', minHeight: 52, gap: 10, fontSize: '1rem' }}
            onClick={generate}
            disabled={generating || included === 0 || loadingData || !analysis}
          >
            {generating ? (
              <>
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
                {status || 'Generating...'}
              </>
            ) : (
              <>📄 Generate &amp; Download PDF</>
            )}
          </button>

          {included === 0 && (
            <p style={{ textAlign: 'center', fontSize: '0.82rem', color: 'var(--accent-danger)' }}>
              ⚠️ Select at least one section.
            </p>
          )}

          <div style={{ display: 'flex', gap: 10 }}>
            <Link href="/analysis" className="btn btn-ghost btn-sm no-print" style={{ flex: 1, justifyContent: 'center' }}>
              📊 View Analysis
            </Link>
            <Link href="/dashboard" className="btn btn-ghost btn-sm no-print" style={{ flex: 1, justifyContent: 'center' }}>
              🏠 Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

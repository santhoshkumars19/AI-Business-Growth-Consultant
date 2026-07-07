'use client';
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const sections = [
  { id:'score', label:'Business Health Score', icon:'🧠', included:true },
  { id:'revenue', label:'Revenue & Expense Charts', icon:'💰', included:true },
  { id:'recommendations', label:'AI Recommendations', icon:'🎯', included:true },
  { id:'swot', label:'SWOT Analysis', icon:'📋', included:true },
  { id:'marketing', label:'30-Day Marketing Plan', icon:'📅', included:false },
  { id:'competitor', label:'Competitor Analysis', icon:'⚔️', included:false },
  { id:'growth', label:'Growth Score Timeline', icon:'📈', included:false },
  { id:'seo', label:'SEO Audit Results', icon:'🔎', included:false },
];
export default function PdfExportPage() {
  const { user, fetchWithAuth } = useAuth();
  const [selected, setSelected] = useState(sections.map(s=>({ ...s })));
  const [generating, setGenerating] = useState(false);
  const [logo, setLogo] = useState<string | null>(null);

  const toggle = (id: string) => setSelected(prev=>prev.map(s=>s.id===id?{...s,included:!s.included}:s));
  const included = selected.filter(s=>s.included).length;

  const generate = async () => {
    setGenerating(true);
    try {
      const blob = await fetchWithAuth('/reports/pdf', { method: 'POST' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GrowthIQ_Report_${user?.businessData?.business_name || 'business'}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      alert(`Failed to generate PDF: ${err.message || err}`);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:4 }}>Download PDF Report</h1>
        <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem' }}>Customise and download a professional PDF report of your business analysis</p>
      </div>

      <div className="grid-2" style={{ alignItems:'start' }}>
        {/* Configuration */}
        <div className="card p-6">
          <h2 style={{ fontWeight:700, marginBottom:20 }}>📋 Select Sections</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:10, marginBottom:24 }}>
            {selected.map(s=>(
              <label key={s.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 14px', borderRadius:10, border:`1px solid ${s.included?'var(--accent-primary)':'var(--border)'}`, background:s.included?'rgba(var(--accent-primary-rgb),0.06)':'var(--bg-elevated)', cursor:'pointer', transition:'all 0.15s ease' }}>
                <input type="checkbox" checked={s.included} onChange={()=>toggle(s.id)} style={{ accentColor:'var(--accent-primary)', width:16, height:16 }} />
                <span style={{ fontSize:'1.1rem' }}>{s.icon}</span>
                <span style={{ fontSize:'0.875rem', fontWeight:s.included?600:400 }}>{s.label}</span>
              </label>
            ))}
          </div>

          <div className="divider" style={{ marginBottom:20 }} />

          <h3 style={{ fontWeight:700, marginBottom:14 }}>🏢 Business Branding</h3>
          <div className="input-group" style={{ marginBottom:14 }}>
            <label className="input-label">Business Logo (optional)</label>
            <input type="file" accept="image/*" onChange={e=>{ const f=e.target.files?.[0]; if(f){ const r=new FileReader(); r.onload=ev=>setLogo(ev.target?.result as string); r.readAsDataURL(f); } }} style={{ display:'none' }} id="logo-upload" />
            <label htmlFor="logo-upload" className="btn btn-ghost" style={{ width:'100%', justifyContent:'center', cursor:'pointer' }}>
              {logo ? '✅ Logo uploaded' : '📤 Upload Logo'}
            </label>
          </div>
          <div className="input-group">
            <label className="input-label">Report Title</label>
            <input className="input" defaultValue={`${user?.businessData?.businessName||'Business'} — Growth Analysis Report`} />
          </div>
        </div>

        {/* Preview + Generate */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {/* Preview Thumbnail */}
          <div className="card p-6">
            <h2 style={{ fontWeight:700, marginBottom:16 }}>👁️ Report Preview</h2>
            <div style={{ background:'white', borderRadius:12, padding:20, border:'1px solid var(--border)', color:'#0F172A' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'2px solid #6366F1', paddingBottom:12, marginBottom:16 }}>
                <div>
                  <div style={{ fontFamily:'Outfit', fontWeight:800, fontSize:'1.1rem', color:'#6366F1' }}>GrowthIQ AI</div>
                  <div style={{ fontSize:'0.7rem', color:'#6B7280' }}>Business Analysis Report</div>
                </div>
                <div style={{ textAlign:'right', fontSize:'0.68rem', color:'#6B7280' }}>
                  <div>{user?.businessData?.businessName||'Bloom Bakery'}</div>
                  <div>{new Date().toLocaleDateString('en-IN')}</div>
                </div>
              </div>
              {selected.filter(s=>s.included).slice(0,4).map(s=>(
                <div key={s.id} style={{ display:'flex', alignItems:'center', gap:8, padding:'6px 0', borderBottom:'1px solid #F1F5F9' }}>
                  <span>{s.icon}</span>
                  <div style={{ flex:1, height:8, background:'#F1F5F9', borderRadius:4 }} />
                </div>
              ))}
              {included > 4 && <div style={{ textAlign:'center', fontSize:'0.68rem', color:'#6B7280', marginTop:8 }}>+{included-4} more sections...</div>}
            </div>
          </div>

          {/* Summary */}
          <div className="card p-5">
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
              <div style={{ textAlign:'center', padding:12, background:'var(--bg-elevated)', borderRadius:10 }}>
                <div style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'1.5rem', color:'var(--accent-primary)' }}>{included}</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Sections included</div>
              </div>
              <div style={{ textAlign:'center', padding:12, background:'var(--bg-elevated)', borderRadius:10 }}>
                <div style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'1.5rem', color:'var(--accent-success)' }}>~{included*2} pgs</div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Estimated pages</div>
              </div>
            </div>
          </div>

          <button className="btn btn-primary btn-xl" style={{ width:'100%', justifyContent:'center' }} onClick={generate} disabled={generating||included===0}>
            {generating ? (
              <><div className="spinner" />Generating Report ({included} sections)...</>
            ) : (
              <>📄 Generate & Download PDF</>
            )}
          </button>

          {included === 0 && <p style={{ textAlign:'center', fontSize:'0.82rem', color:'var(--accent-danger)' }}>⚠️ Select at least one section to generate the report.</p>}

          <div style={{ display:'flex', gap:10 }}>
            <button className="btn btn-ghost btn-sm" style={{ flex:1 }}>📧 Email Report</button>
            <button className="btn btn-ghost btn-sm" style={{ flex:1 }}>🔗 Share Link</button>
          </div>
        </div>
      </div>
    </div>
  );
}

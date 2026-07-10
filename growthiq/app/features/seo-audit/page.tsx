'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const staticAuditItems = [
  { category:'Technical', item:'Page load speed', status:'warning', priority:'Critical', fix:'Compress images and enable lazy loading. Current LCP: 4.2s, target: <2.5s', current:'4.2s', target:'<2.5s' },
  { category:'Technical', item:'Mobile responsiveness', status:'ok', priority:'Info', fix:'Site is mobile-friendly.', current:'Pass', target:'Pass' },
  { category:'Technical', item:'HTTPS Security', status:'ok', priority:'Info', fix:'SSL certificate valid.', current:'Valid', target:'Valid' },
  { category:'Technical', item:'Sitemap.xml', status:'error', priority:'Warning', fix:'Create and submit sitemap.xml to Google Search Console.', current:'Missing', target:'Submitted' },
  { category:'Technical', item:'robots.txt', status:'warning', priority:'Warning', fix:'Update robots.txt to allow indexing of key pages.', current:'Blocking /products', target:'Allow all' },
  { category:'On-Page', item:'Title tags', status:'warning', priority:'Critical', fix:'3 pages missing title tags. Add unique 50-60 char titles.', current:'4/7 pages', target:'7/7 pages' },
  { category:'On-Page', item:'Meta descriptions', status:'error', priority:'Critical', fix:'Only 2 pages have meta descriptions. Write 150-160 char descriptions.', current:'2/7 pages', target:'7/7 pages' },
  { category:'On-Page', item:'Heading structure (H1)', status:'ok', priority:'Info', fix:'All pages have proper H1 tags.', current:'7/7 pages', target:'7/7 pages' },
  { category:'Content', item:'Keyword targeting', status:'warning', priority:'Warning', fix:'Target local industry keywords — currently no content for these terms.', current:'Not targeted', target:'3 pages' },
  { category:'Content', item:'Blog / content', status:'error', priority:'Critical', fix:'No blog posts found. Start a blog with 2 posts/month for organic traffic.', current:'0 posts', target:'8+ posts' },
  { category:'Backlinks', item:'Domain authority', status:'warning', priority:'Warning', fix:'DA score: 12. Build backlinks via local business directories.', current:'DA 12', target:'DA 25+' },
];

export default function SeoAuditPage() {
  const { user, fetchWithAuth } = useAuth();
  const [auditItems, setAuditItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState('https://yourbusiness.in');
  const [running, setRunning] = useState(false);
  const [ran, setRan] = useState(true);
  const [activeTab, setActiveTab] = useState('Technical');
  const categories = ['Technical','On-Page','Content','Backlinks'];

  useEffect(() => {
    if (user?.businessData?.business_name) {
      setUrl('https://' + user.businessData.business_name.toLowerCase().replace(/\s+/g, '') + '.in');
    }
  }, [user]);

  useEffect(() => {
    const loadSeo = async () => {
      try {
        const data = await fetchWithAuth('/features/seo-audit');
        if (data.seo_tips && data.seo_tips.length > 0) {
          const mapped = data.seo_tips.map((item: any) => {
            const priorityVal = item.priority || 'medium';
            const categoryVal = item.category || 'Technical';
            
            let statusVal = 'ok';
            if (priorityVal === 'high') statusVal = 'error';
            else if (priorityVal === 'medium') statusVal = 'warning';
            
            let priorityLabel = 'Info';
            if (priorityVal === 'high') priorityLabel = 'Critical';
            else if (priorityVal === 'medium') priorityLabel = 'Warning';

            return {
              category: categoryVal,
              item: item.issue || 'SEO Optimization Point',
              status: statusVal,
              priority: priorityLabel,
              fix: item.recommendation || '',
              current: statusVal === 'ok' ? 'Pass' : statusVal === 'warning' ? 'Needs Work' : 'Missing',
              target: 'Pass'
            };
          });
          setAuditItems(mapped);
        } else {
          setAuditItems(staticAuditItems);
        }
      } catch (e) {
        console.error('Failed to load SEO audit:', e);
        setAuditItems(staticAuditItems);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      loadSeo();
    }
  }, [user]);

  const runAudit = () => { setRunning(true); setTimeout(()=>{ setRunning(false); setRan(true); }, 2000); };
  
  const score = Math.round(
    (auditItems.filter(a => a.status === 'ok').length / Math.max(1, auditItems.length)) * 100
  ) || 60;

  const scoreColor = score >= 70 ? 'var(--accent-success)' : score >= 40 ? 'var(--accent-warning)' : 'var(--accent-danger)';
  const filtered = auditItems.filter(a => a.category === activeTab);
  if (loading) {
    return (
      <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading SEO Audit...</p>
      </div>
    );
  }

  const quickWins = auditItems.filter(a => a.status === 'error' || (a.status === 'warning' && a.priority === 'Critical')).slice(0, 3);

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:4 }}>SEO Audit</h1>
        <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem' }}>Identify and fix issues affecting your search engine rankings</p>
      </div>

      {/* URL Input */}
      <div className="card p-6" style={{ marginBottom:24 }}>
        <div style={{ display:'flex', gap:12 }}>
          <input className="input" style={{ flex:1 }} placeholder="https://yourbusiness.com" value={url} onChange={e=>setUrl(e.target.value)} />
          <button className="btn btn-primary btn-lg" onClick={runAudit} disabled={running} style={{ minWidth:130 }}>
            {running ? <><div className="spinner" /> Scanning...</> : '🔎 Run Audit'}
          </button>
        </div>
      </div>

      {ran && (
        <>
          {/* Score Header */}
          <div className="grid-2" style={{ marginBottom:24 }}>
            <div className="card p-6" style={{ display:'flex', alignItems:'center', gap:28 }}>
              <div style={{ position:'relative', width:110, height:110, flexShrink:0 }}>
                <div style={{ width:'100%', height:'100%', borderRadius:'50%', background:`conic-gradient(${scoreColor} 0% ${score}%, var(--bg-elevated) ${score}% 100%)`, display:'flex', alignItems:'center', justifyContent:'center' }}>
                  <div style={{ width:80, height:80, borderRadius:'50%', background:'var(--bg-surface)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'1.6rem', color:scoreColor }}>{score}</span>
                  </div>
                </div>
              </div>
              <div>
                <div style={{ fontWeight:800, fontSize:'1.1rem', marginBottom:6 }}>SEO Health Score</div>
                <div className="badge badge-warning" style={{ marginBottom:10 }}>Needs Improvement</div>
                <p style={{ fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.6 }}>Fix the critical issues below to significantly improve your Google rankings.</p>
              </div>
            </div>
            <div className="card p-6">
              <h3 style={{ fontWeight:700, marginBottom:14 }}>🚀 Quick Wins (Fix These First)</h3>
              {quickWins.map((q,i)=>(
                <div key={i} style={{ padding:'10px 12px', borderRadius:10, background:'rgba(var(--accent-danger-rgb),0.06)', border:'1px solid rgba(var(--accent-danger-rgb),0.2)', marginBottom:8 }}>
                  <div style={{ fontWeight:600, fontSize:'0.85rem', marginBottom:3 }}>{q.item}</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text-secondary)', lineHeight:1.5 }}>{q.fix}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Issue Stats */}
          <div className="grid-4" style={{ marginBottom:20 }}>
            {[['❌','Critical',auditItems.filter(a=>a.priority==='Critical').length,'danger'],['⚠️','Warnings',auditItems.filter(a=>a.status==='warning').length,'warning'],['✅','Passed',auditItems.filter(a=>a.status==='ok').length,'success'],['📋','Total Items',auditItems.length,'muted']].map(([icon,label,count,color])=>(
              <div key={label} className="stat-card" style={{ textAlign:'center' }}>
                <div style={{ fontSize:'1.5rem', marginBottom:4 }}>{icon}</div>
                <div style={{ fontFamily:'JetBrains Mono', fontWeight:700, fontSize:'1.5rem', color:`var(--accent-${color})` }}>{count}</div>
                <div style={{ fontSize:'0.78rem', color:'var(--text-muted)' }}>{label}</div>
              </div>
            ))}
          </div>

          {/* Tabbed Report */}
          <div className="card">
            <div className="tabs" style={{ padding:'0 24px' }}>
              {categories.map(cat=>(
                <button key={cat} className={`tab ${activeTab===cat?'active':''}`} onClick={()=>setActiveTab(cat)}>{cat}</button>
              ))}
            </div>
            <div style={{ padding:'20px 24px' }}>
              {filtered.map((a,i)=>(
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:14, padding:'14px 0', borderBottom: i<filtered.length-1 ? '1px solid var(--border)':'' }}>
                  <span style={{ fontSize:'1.1rem', marginTop:2, flexShrink:0 }}>{a.status==='ok'?'✅':a.status==='warning'?'⚠️':'❌'}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <span style={{ fontWeight:600, fontSize:'0.9rem' }}>{a.item}</span>
                      <span className={`badge badge-${a.priority==='Critical'?'danger':a.priority==='Warning'?'warning':'muted'}`}>{a.priority}</span>
                    </div>
                    <div style={{ fontSize:'0.82rem', color:'var(--text-secondary)', lineHeight:1.5 }}>{a.fix}</div>
                    <div className="hide-desktop" style={{ fontSize:'0.8rem', marginTop:4 }}>
                      <span style={{ color:'var(--text-muted)' }}>Current: </span>
                      <strong style={{ color: a.status==='ok'?'var(--accent-success)':'var(--text-primary)' }}>{a.current}</strong>
                    </div>
                  </div>
                  <div className="hide-mobile" style={{ textAlign:'right', flexShrink:0 }}>
                    <div style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>Current</div>
                    <div style={{ fontSize:'0.82rem', fontWeight:600, color: a.status==='ok'?'var(--accent-success)':'var(--text-primary)' }}>{a.current}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

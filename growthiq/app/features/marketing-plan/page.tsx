'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

type ActivityType = 'social' | 'ad' | 'email' | 'promo';

const COLOR_MAP: Record<ActivityType, string> = { social:'#6366F1', ad:'#8B5CF6', email:'#10B981', promo:'#F59E0B' };
const LABEL_MAP: Record<ActivityType, string> = { social:'Social Post', ad:'Paid Ad', email:'Email Campaign', promo:'Promotion' };

export default function MarketingPlanPage() {
  const { fetchWithAuth, user } = useAuth();
  const [plan, setPlan] = useState<Record<number, { type: ActivityType; title: string; platform: string; budget: string; reach: string; caption: string }[]>>({});
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [view, setView] = useState<'month'|'week'>('month');
  const [activeWeek, setActiveWeek] = useState(0);

  const [isAddingActivity, setIsAddingActivity] = useState(false);
  const [newActTitle, setNewActTitle] = useState('');
  const [newActType, setNewActType] = useState<ActivityType>('social');
  const [newActPlatform, setNewActPlatform] = useState('Instagram');
  const [newActBudget, setNewActBudget] = useState('Organic');
  const [newActReach, setNewActReach] = useState('500-1,000');
  const [newActCaption, setNewActCaption] = useState('');

  const handleSaveNewActivity = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDay || !newActTitle.trim()) return;
    
    const newActivity = {
      type: newActType,
      title: newActTitle,
      platform: newActPlatform,
      budget: newActBudget,
      reach: newActReach,
      caption: newActCaption
    };

    setPlan(prev => {
      const updated = { ...prev };
      if (!updated[selectedDay]) updated[selectedDay] = [];
      updated[selectedDay] = [...updated[selectedDay], newActivity];
      return updated;
    });

    // Reset fields
    setNewActTitle('');
    setNewActType('social');
    setNewActPlatform('Instagram');
    setNewActBudget('Organic');
    setNewActReach('500-1,000');
    setNewActCaption('');
    setIsAddingActivity(false);
  };

  useEffect(() => {
    const loadPlan = async () => {
      try {
        const data = await fetchWithAuth('/features/marketing-plan');
        if (data.marketing_plan && data.marketing_plan.length > 0) {
          const mapped: Record<number, any[]> = {};
          data.marketing_plan.forEach((item: any) => {
            const day = parseInt(item.day) || 1;
            if (!mapped[day]) mapped[day] = [];
            
            let actType: ActivityType = 'social';
            const platLower = (item.platform || '').toLowerCase();
            const titleLower = (item.title || '').toLowerCase();
            const descLower = (item.description || '').toLowerCase();
            
            if (platLower.includes('email')) {
              actType = 'email';
            } else if (platLower.includes('ad') || titleLower.includes('ad') || descLower.includes('ad')) {
              actType = 'ad';
            } else if (titleLower.includes('offer') || descLower.includes('offer') || titleLower.includes('discount') || descLower.includes('discount') || titleLower.includes('promo')) {
              actType = 'promo';
            }

            mapped[day].push({
              type: actType,
              title: item.title || 'Marketing Activity',
              platform: item.platform || 'Social Media',
              budget: item.budget || 'Organic',
              reach: item.estimated_reach || item.reach || '500-1,000',
              caption: item.description || item.caption || ''
            });
          });
          setPlan(mapped);
        }
      } catch (e) {
        console.error('Failed to load marketing plan:', e);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      loadPlan();
    }
  }, [user]);

  const days = Array.from({length:30},(_,i)=>i+1);
  const weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];

  const WEEK_LABELS = [
    'Week 1: July 1 – July 5',
    'Week 2: July 6 – July 12',
    'Week 3: July 13 – July 19',
    'Week 4: July 20 – July 26',
    'Week 5: July 27 – July 30',
  ];

  const handleSetView = (v: 'month' | 'week') => {
    setView(v);
    if (v === 'week') {
      const w = selectedDay ? Math.floor((selectedDay + 1) / 7) : 0;
      setActiveWeek(w);
    }
  };

  const handlePrevWeek = () => setActiveWeek(w => Math.max(0, w - 1));
  const handleNextWeek = () => setActiveWeek(w => Math.min(4, w + 1));
  if (loading) {
    return (
      <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading Marketing Plan...</p>
      </div>
    );
  }

  const budgetTotal = Object.values(plan).flat().reduce((a,p)=>a+(p.budget.startsWith('₹')?parseInt(p.budget.slice(1).replace(',','')):0),0);
  const activityCount = Object.values(plan).flat().length;
  const selectedActivities = selectedDay ? (plan[selectedDay] || []) : [];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:4 }}>30-Day Marketing Plan</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem' }}>AI-generated marketing calendar for July 2026</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          {(['month','week'] as const).map(v=>(
            <button key={v} onClick={()=>handleSetView(v)} className="btn btn-sm" style={{ background:view===v?'var(--accent-primary)':'var(--bg-elevated)', color:view===v?'#fff':'var(--text-secondary)', textTransform:'capitalize' }}>{v} View</button>
          ))}
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid-4" style={{ marginBottom:20, gap:12 }}>
        {[['📅','Activities',''+activityCount,'planned'],['💰','Budget','₹'+budgetTotal.toLocaleString('en-IN'),'estimated'],['📣','Est. Reach','45K–72K','impressions'],['🎯','Channels','4','platforms']].map(([icon,label,val,sub])=>(
          <div key={label} style={{ padding:'14px 16px', background:'var(--bg-surface)', borderRadius:12, border:'1px solid var(--border)', display:'flex', alignItems:'center', gap:12 }}>
            <span style={{ fontSize:'1.5rem' }}>{icon}</span>
            <div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)', textTransform:'uppercase' }}>{label}</div>
              <div style={{ fontFamily:'JetBrains Mono', fontWeight:700 }}>{val}</div>
              <div style={{ fontSize:'0.7rem', color:'var(--text-muted)' }}>{sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ display:'flex', gap:16, marginBottom:16, flexWrap:'wrap' }}>
        {Object.entries(LABEL_MAP).map(([type, label])=>(
          <div key={type} style={{ display:'flex', alignItems:'center', gap:6, fontSize:'0.8rem', color:'var(--text-secondary)' }}>
            <div style={{ width:10, height:10, borderRadius:'50%', background:COLOR_MAP[type as ActivityType] }} />{label}
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns: selectedDay ? 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))' : '1fr', gap:20 }}>
        {/* Calendar */}
        <div className="card p-4">
          {/* Week headers */}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4, marginBottom:4 }}>
            {weekDays.map(d=><div key={d} style={{ textAlign:'center', fontSize:'0.72rem', fontWeight:600, color:'var(--text-muted)', padding:'6px 0' }}>{d}</div>)}
          </div>
          {/* Day cells — start week on Mon (July 2026 starts Wed, so offset=2) */}
          {view === 'month' ? (
            <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
              {[...Array(2)].map((_,i)=><div key={`e${i}`} />)}
              {days.map(d=>{
                const acts = plan[d] || [];
                const isSelected = selectedDay===d;
                return (
                  <div key={d} onClick={()=>{setSelectedDay(d===selectedDay?null:d); setActiveWeek(Math.floor((d + 1) / 7));}} className="calendar-day" style={{ borderColor: isSelected ? 'var(--accent-primary)' : acts.length ? 'rgba(var(--accent-primary-rgb),0.3)' : 'var(--border)', background: isSelected ? 'rgba(var(--accent-primary-rgb),0.1)' : 'var(--bg-surface)' }}>
                    <div style={{ fontSize:'0.75rem', fontWeight:600, color:isSelected?'var(--accent-primary)':'var(--text-secondary)', marginBottom:4 }}>{d}</div>
                    <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
                      {acts.map((a,i)=><div key={i} style={{ width:8, height:8, borderRadius:'50%', background:COLOR_MAP[a.type] }} />)}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div>
              {/* Week Navigation Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {WEEK_LABELS[activeWeek]}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button onClick={handlePrevWeek} disabled={activeWeek === 0} className="btn btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem', border: '1px solid var(--border)' }}>← Prev</button>
                  <button onClick={handleNextWeek} disabled={activeWeek === 4} className="btn btn-sm" style={{ padding: '4px 10px', fontSize: '0.75rem', border: '1px solid var(--border)' }}>Next →</button>
                </div>
              </div>
              
              <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
                {Array.from({ length: 7 }).map((_, i) => {
                  const cellIndex = activeWeek * 7 + i;
                  if (cellIndex < 2) {
                    return <div key={`e${cellIndex}`} />;
                  }
                  const d = cellIndex - 1;
                  if (d > 30) {
                    return <div key={`e${cellIndex}`} />;
                  }
                  
                  const acts = plan[d] || [];
                  const isSelected = selectedDay===d;
                  return (
                    <div key={d} onClick={()=>setSelectedDay(d===selectedDay?null:d)} className="calendar-day" style={{ borderColor: isSelected ? 'var(--accent-primary)' : acts.length ? 'rgba(var(--accent-primary-rgb),0.3)' : 'var(--border)', background: isSelected ? 'rgba(var(--accent-primary-rgb),0.1)' : 'var(--bg-surface)' }}>
                      <div style={{ fontSize:'0.75rem', fontWeight:600, color:isSelected?'var(--accent-primary)':'var(--text-secondary)', marginBottom:4 }}>{d}</div>
                      <div style={{ display:'flex', gap:3, flexWrap:'wrap' }}>
                        {acts.map((a,i)=><div key={i} style={{ width:8, height:8, borderRadius:'50%', background:COLOR_MAP[a.type] }} />)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Day Detail Panel */}
        {selectedDay && (
          <div className="card p-5">
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
              <h3 style={{ fontWeight:700 }}>July {selectedDay}, 2026</h3>
              <button onClick={()=>setSelectedDay(null)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'1.25rem' }}>×</button>
            </div>
            {selectedActivities.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">📭</div>
                <p style={{ color:'var(--text-muted)', fontSize:'0.875rem' }}>No activities planned for this day.</p>
                <button onClick={() => setIsAddingActivity(true)} className="btn btn-ghost btn-sm" style={{ marginTop:8 }}>＋ Add Activity</button>
              </div>
            ) : (
              <div>
                {selectedActivities.map((a,i)=>(
                  <div key={i} style={{ padding:'14px 16px', borderRadius:12, border:`1px solid ${COLOR_MAP[a.type]}40`, background:`${COLOR_MAP[a.type]}10`, marginBottom:12 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10 }}>
                      <span style={{ fontSize:'0.75rem', fontWeight:700, padding:'2px 8px', borderRadius:99, background:COLOR_MAP[a.type], color:'#fff' }}>{LABEL_MAP[a.type]}</span>
                      <span style={{ fontSize:'0.75rem', color:'var(--text-muted)' }}>{a.platform}</span>
                    </div>
                    <div style={{ fontWeight:600, fontSize:'0.9rem', marginBottom:8 }}>{a.title}</div>
                    <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', lineHeight:1.6, background:'var(--bg-surface)', padding:'10px 12px', borderRadius:8, marginBottom:10, fontStyle:'italic' }}>"{a.caption}"</div>
                    <div style={{ display:'flex', gap:12, fontSize:'0.78rem' }}>
                      <span>💰 {a.budget}</span>
                      <span>👁️ {a.reach} impressions</span>
                    </div>
                  </div>
                ))}
                <button onClick={() => setIsAddingActivity(true)} className="btn btn-ghost btn-sm" style={{ width:'100%', justifyContent:'center', marginTop:8 }}>＋ Add Another Activity</button>
              </div>
            )}
          </div>
        )}
      </div>

      {isAddingActivity && selectedDay && (
        <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:16 }}>
          <div className="card p-6" style={{ width:'100%', maxWidth:450, position:'relative', background:'var(--bg-surface)', border:'1px solid var(--border)' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontWeight:700, margin:0 }}>Add Activity for Day {selectedDay}</h3>
              <button onClick={() => setIsAddingActivity(false)} style={{ background:'none', border:'none', cursor:'pointer', color:'var(--text-muted)', fontSize:'1.5rem' }}>×</button>
            </div>
            
            <form onSubmit={handleSaveNewActivity} style={{ display:'flex', flexDirection:'column', gap:12 }}>
              <div>
                <label style={{ display:'block', fontSize:'0.75rem', color:'var(--text-secondary)', marginBottom:4, fontWeight:600 }}>Activity Title</label>
                <input className="input" style={{ width:'100%' }} value={newActTitle} onChange={e=>setNewActTitle(e.target.value)} placeholder="e.g. Launch Summer Special Post" required />
              </div>
              
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <label style={{ display:'block', fontSize:'0.75rem', color:'var(--text-secondary)', marginBottom:4, fontWeight:600 }}>Category</label>
                  <select className="input" style={{ width:'100%', background:'var(--bg-elevated)', color:'var(--text-primary)', border:'1px solid var(--border)', padding:'8px 10px', borderRadius:8 }} value={newActType} onChange={e=>setNewActType(e.target.value as ActivityType)}>
                    <option value="social">Social Post</option>
                    <option value="ad">Paid Ad</option>
                    <option value="email">Email Campaign</option>
                    <option value="promo">Promotion</option>
                  </select>
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'0.75rem', color:'var(--text-secondary)', marginBottom:4, fontWeight:600 }}>Platform</label>
                  <input className="input" style={{ width:'100%' }} value={newActPlatform} onChange={e=>setNewActPlatform(e.target.value)} placeholder="e.g. Instagram" required />
                </div>
              </div>
              
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                <div>
                  <label style={{ display:'block', fontSize:'0.75rem', color:'var(--text-secondary)', marginBottom:4, fontWeight:600 }}>Budget</label>
                  <input className="input" style={{ width:'100%' }} value={newActBudget} onChange={e=>setNewActBudget(e.target.value)} placeholder="e.g. Organic or ₹500" required />
                </div>
                <div>
                  <label style={{ display:'block', fontSize:'0.75rem', color:'var(--text-secondary)', marginBottom:4, fontWeight:600 }}>Est. Reach</label>
                  <input className="input" style={{ width:'100%' }} value={newActReach} onChange={e=>setNewActReach(e.target.value)} placeholder="e.g. 500-1,000" required />
                </div>
              </div>
              
              <div>
                <label style={{ display:'block', fontSize:'0.75rem', color:'var(--text-secondary)', marginBottom:4, fontWeight:600 }}>Caption / Description</label>
                <textarea className="input" style={{ width:'100%', minHeight:80, resize:'vertical' }} value={newActCaption} onChange={e=>setNewActCaption(e.target.value)} placeholder="Write description or post caption..." />
              </div>
              
              <div style={{ display:'flex', gap:10, marginTop:10 }}>
                <button type="button" onClick={() => setIsAddingActivity(false)} className="btn btn-ghost" style={{ flex:1, justifyContent:'center' }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex:1, justifyContent:'center' }}>Save Activity</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

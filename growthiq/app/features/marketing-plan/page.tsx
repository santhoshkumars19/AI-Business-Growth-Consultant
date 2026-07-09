'use client';
import { useState } from 'react';

type ActivityType = 'social' | 'ad' | 'email' | 'promo';

const COLOR_MAP: Record<ActivityType, string> = { social:'#6366F1', ad:'#8B5CF6', email:'#10B981', promo:'#F59E0B' };
const LABEL_MAP: Record<ActivityType, string> = { social:'Social Post', ad:'Paid Ad', email:'Email Campaign', promo:'Promotion' };

const PLAN: Record<number, { type: ActivityType; title: string; platform: string; budget: string; reach: string; caption: string }[]> = {
  1:[{type:'social',title:'Welcome July! Summer special post',platform:'Instagram',budget:'Organic',reach:'800–1,200',caption:'☀️ Beat the heat with our special July menu! Fresh ingredients, cool prices. Come visit us today. #MumbaiFoodie #SummerSpecial'}],
  3:[{type:'ad',title:'Boosted testimonial ad',platform:'Instagram',budget:'₹600',reach:'3,500–5,000',caption:'See why 165+ customers call Bloom Bakery their favourite! 🧁 Tap to discover our story.'}],
  5:[{type:'email',title:'Newsletter: July offers',platform:'Email',budget:'Free',reach:'All subscribers',caption:'Subject: 🌟 July is here and so are our best deals! Hi {name}, check out what\'s new this month...'}],
  7:[{type:'social',title:'Behind the scenes reel',platform:'Instagram',budget:'Organic',reach:'1,200–2,400',caption:'From oven to your plate in 3 hours! 🔥 Watch how we make our signature croissants. #BakeryLife #FoodReel'}],
  10:[{type:'promo',title:'Mid-month discount push',platform:'WhatsApp + Instagram',budget:'₹800',reach:'5,000–7,000',caption:'🎁 Exclusive offer for our loyal customers: 20% off on orders above ₹500 this weekend only!'}],
  14:[{type:'ad',title:'Retargeting campaign',platform:'Meta Ads',budget:'₹1,200',reach:'10,000–15,000',caption:'Still thinking about it? 😊 Come try Bloom Bakery — your first croissant is on us with code FIRST.'}],
  18:[{type:'social',title:'Customer spotlight post',platform:'Instagram',budget:'Organic',reach:'600–1,000',caption:'Meet Meera — one of our 165 amazing regulars! ❤️ Thank you for your loyalty. Tag a friend who needs to try Bloom!'}],
  21:[{type:'email',title:'Referral program launch',platform:'Email + WhatsApp',budget:'Free',reach:'All contacts',caption:'🎉 Big news! Refer a friend and both of you get ₹200 off your next order. Share your unique code: BLOOM-{code}'}],
  25:[{type:'ad',title:'Weekend special ads',platform:'Instagram Stories',budget:'₹500',reach:'2,500–4,000',caption:'This weekend at Bloom Bakery 🥐: Free coffee with any order above ₹300! Saturday + Sunday only.'}],
  28:[{type:'promo',title:'Month-end summary + teaser',platform:'Instagram + Facebook',budget:'₹400',reach:'2,000–3,500',caption:'What a month! 🙏 Thank you Mumbai for the love. Something exciting is coming in August... stay tuned! 👀'}],
};

export default function MarketingPlanPage() {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [view, setView] = useState<'month'|'week'>('month');
  const days = Array.from({length:30},(_,i)=>i+1);
  const weekDays = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const budgetTotal = Object.values(PLAN).flat().reduce((a,p)=>a+(p.budget.startsWith('₹')?parseInt(p.budget.slice(1).replace(',','')):0),0);
  const activityCount = Object.values(PLAN).flat().length;
  const selectedActivities = selectedDay ? (PLAN[selectedDay] || []) : [];

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:4 }}>30-Day Marketing Plan</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem' }}>AI-generated marketing calendar for July 2026</p>
        </div>
        <div style={{ display:'flex', gap:10 }}>
          {(['month','week'] as const).map(v=>(
            <button key={v} onClick={()=>setView(v)} className="btn btn-sm" style={{ background:view===v?'var(--accent-primary)':'var(--bg-elevated)', color:view===v?'#fff':'var(--text-secondary)', textTransform:'capitalize' }}>{v} View</button>
          ))}
          <button className="btn btn-primary btn-sm" onClick={()=>window.print()}>📄 Download PDF</button>
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
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:4 }}>
            {[...Array(2)].map((_,i)=><div key={`e${i}`} />)}
            {days.map(d=>{
              const acts = PLAN[d] || [];
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
                <button className="btn btn-ghost btn-sm" style={{ marginTop:8 }}>＋ Add Activity</button>
              </div>
            ) : selectedActivities.map((a,i)=>(
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
          </div>
        )}
      </div>
    </div>
  );
}

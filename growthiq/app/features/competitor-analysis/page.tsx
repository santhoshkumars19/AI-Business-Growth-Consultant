'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const axes = ['Online Presence', 'Pricing', 'Customer Reviews', 'Market Share', 'Growth Rate', 'Product Range'];
const axisKeys = ['online', 'pricing', 'reviews', 'market', 'growth', 'products'] as const;

// Industry Competitor Generators
function getCompetitorsForIndustry(industry: string, businessName: string) {
  const norm = (industry || '').toLowerCase();
  
  if (norm.includes('pharmacy') || norm.includes('medical') || norm.includes('health')) {
    return [
      { name: businessName || 'Your Pharmacy', short: 'You', scores: { online: 68, pricing: 72, reviews: 75, market: 60, growth: 70, products: 65 }, color: '#6366F1', revenue: '₹3.5L', customers: 240, rating: 4.5, isUser: true },
      { name: 'Apollo Pharmacy', short: 'AP', scores: { online: 85, pricing: 65, reviews: 80, market: 82, growth: 60, products: 88 }, color: '#F59E0B', revenue: '₹6.2L', customers: 490, rating: 4.7, isUser: false },
      { name: 'MedPlus Wellness', short: 'MP', scores: { online: 72, pricing: 78, reviews: 70, market: 68, growth: 65, products: 75 }, color: '#EC4899', revenue: '₹4.8L', customers: 310, rating: 4.3, isUser: false },
    ];
  }
  
  if (norm.includes('food') || norm.includes('bakery') || norm.includes('restaurant') || norm.includes('cafe')) {
    return [
      { name: businessName || 'Your Business', short: 'You', scores: { online: 68, pricing: 72, reviews: 75, market: 60, growth: 70, products: 65 }, color: '#6366F1', revenue: '₹2.5L', customers: 165, rating: 4.6, isUser: true },
      { name: "Kiran's Bakery", short: 'KB', scores: { online: 74, pricing: 60, reviews: 82, market: 70, growth: 55, products: 78 }, color: '#F59E0B', revenue: '₹3.1L', customers: 210, rating: 4.8, isUser: false },
      { name: 'Sweet Bakers Co.', short: 'SB', scores: { online: 55, pricing: 80, reviews: 65, market: 50, growth: 40, products: 60 }, color: '#EC4899', revenue: '₹1.8L', customers: 130, rating: 4.2, isUser: false },
    ];
  }
  
  if (norm.includes('retail') || norm.includes('fashion') || norm.includes('clothing') || norm.includes('apparel') || norm.includes('shop')) {
    return [
      { name: businessName || 'Your Store', short: 'You', scores: { online: 60, pricing: 75, reviews: 70, market: 58, growth: 65, products: 70 }, color: '#6366F1', revenue: '₹2.8L', customers: 180, rating: 4.4, isUser: true },
      { name: 'StyleHub Apparel', short: 'SH', scores: { online: 78, pricing: 68, reviews: 84, market: 72, growth: 70, products: 80 }, color: '#F59E0B', revenue: '₹4.5L', customers: 290, rating: 4.6, isUser: false },
      { name: 'Trends Fashion', short: 'TF', scores: { online: 64, pricing: 82, reviews: 68, market: 52, growth: 50, products: 62 }, color: '#EC4899', revenue: '₹2.1L', customers: 140, rating: 4.1, isUser: false },
    ];
  }

  // Default Fallback
  return [
    { name: businessName || 'Your Business', short: 'You', scores: { online: 68, pricing: 72, reviews: 75, market: 60, growth: 70, products: 65 }, color: '#6366F1', revenue: '₹2.5L', customers: 165, rating: 4.6, isUser: true },
    { name: 'Competitor Alpha', short: 'CA', scores: { online: 75, pricing: 64, reviews: 80, market: 72, growth: 58, products: 76 }, color: '#F59E0B', revenue: '₹3.4L', customers: 220, rating: 4.7, isUser: false },
    { name: 'Competitor Beta', short: 'CB', scores: { online: 58, pricing: 76, reviews: 68, market: 54, growth: 48, products: 64 }, color: '#EC4899', revenue: '₹1.9L', customers: 125, rating: 4.3, isUser: false },
  ];
}

function getOpportunitiesForIndustry(industry: string) {
  const norm = (industry || '').toLowerCase();
  
  if (norm.includes('pharmacy') || norm.includes('medical') || norm.includes('health')) {
    return [
      { title: 'Medicine Stock Variety Gap', desc: 'Apollo Pharmacy scores 88 in product range vs your 65. Expanding your inventory of rare medications can bridge this gap.', action: 'Order specialized healthcare supplements and rare drugs', impact: 'High' },
      { title: 'Local Map Search Advantage', desc: 'MedPlus scores only 72 online. You can rank higher on Google Maps by actively updating your medicine listings.', action: 'Add list of stocked medicines directly to Google Business Profile', impact: 'High' },
      { title: 'Pricing Adjustments on Generics', desc: 'Apollo Pharmacy charges standard prices but has bulk discounts. You can offer generic drug alternatives at a 15% lower price to draw price-sensitive customers.', action: 'Promote generic alternatives with high margin structures', impact: 'Medium' }
    ];
  }
  
  if (norm.includes('retail') || norm.includes('fashion') || norm.includes('clothing')) {
    return [
      { title: 'Customer Engagement Gap', desc: 'StyleHub scores 84 in customer reviews vs your 70. Establish a digital catalog and collect WhatsApp reviews.', action: 'Launch WhatsApp review requests with 5% reward coupons', impact: 'High' },
      { title: 'Catalog Range Opportunity', desc: 'Trends Fashion has a restricted catalog scope (62). You can scale faster by expanding accessories and season-specific collections.', action: 'Add seasonal collections to front racks', impact: 'Medium' }
    ];
  }

  // default bakery opportunities
  return [
    { title: "Customer Review Gap", desc: "Competitor Alpha scores 80 in reviews vs your 75. Actively request reviews from your regular customers to close this gap.", action: "Request reviews via WhatsApp message", impact: "High" },
    { title: "Online Presence Advantage", desc: "Competitor Beta scores only 58 online. You can capture their local customers by increasing Instagram activity.", action: "Launch Instagram ads targeting local area radius", impact: "High" },
    { title: "Pricing Premium Opportunity", desc: "You price at mid-market. Competitor Alpha charges less but you have better ratings — a 10% price increase won't hurt retention.", action: "Test premium pricing on top 3 products", impact: "Medium" }
  ];
}

function RadarSvg({ competitors }: { competitors: any[] }) {
  const cx = 200, cy = 200, r = 140;
  const n = axes.length;
  const points = (scores: Record<string, number>, maxVal = 100) =>
    axisKeys.map((k, i) => {
      const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
      const val = (scores[k] / maxVal) * r;
      return [cx + val * Math.cos(angle), cy + val * Math.sin(angle)];
    });

  const gridLevels = [25, 50, 75, 100];
  return (
    <svg width="400" height="400" viewBox="0 0 400 400" style={{ maxWidth: '100%' }}>
      {/* Grid */}
      {gridLevels.map(level => {
        const pts = axisKeys.map((_, i) => {
          const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
          const val = (level / 100) * r;
          return `${cx + val * Math.cos(angle)},${cy + val * Math.sin(angle)}`;
        });
        return <polygon key={level} points={pts.join(' ')} fill="none" stroke="var(--border)" strokeWidth="1" />;
      })}
      {/* Axes */}
      {axisKeys.map((_, i) => {
        const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
        return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(angle)} y2={cy + r * Math.sin(angle)} stroke="var(--border)" strokeWidth="1" />;
      })}
      {/* Labels */}
      {axes.map((label, i) => {
        const angle = (i * 2 * Math.PI) / n - Math.PI / 2;
        const lx = cx + (r + 22) * Math.cos(angle);
        const ly = cy + (r + 22) * Math.sin(angle);
        return <text key={i} x={lx} y={ly} textAnchor="middle" dominantBaseline="middle" fill="var(--text-muted)" fontSize="11" fontFamily="Inter">{label}</text>;
      })}
      {/* Data polygons */}
      {competitors.map((comp, ci) => {
        const pts = points(comp.scores).map(([x, y]) => `${x},${y}`).join(' ');
        return (
          <g key={ci}>
            <polygon points={pts} fill={comp.color} fillOpacity="0.15" stroke={comp.color} strokeWidth="2" />
            {points(comp.scores).map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r={4} fill={comp.color} stroke="var(--bg-surface)" strokeWidth="2" />
            ))}
          </g>
        );
      })}
    </svg>
  );
}

export default function CompetitorPage() {
  const { user, fetchWithAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [competitors, setCompetitors] = useState<any[]>([]);
  const [opportunities, setOpportunities] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const userIndustry = user?.businessData?.industry || 'Food & Beverage';
  const userBusinessName = user?.businessData?.business_name || 'Your Business';

  useEffect(() => {
    const loadCompetitors = async () => {
      try {
        const data = await fetchWithAuth('/features/competitor');
        const ci = data.competitor_insights;
        if (ci && ci.competitors && ci.competitors.length > 0) {
          const userRev = user?.businessData?.monthly_revenue || 250000;
          const userCust = user?.businessData?.monthly_customers || 150;
          const updated = ci.competitors.map((c: any) => {
            if (c.isUser || c.short === 'You') {
              return {
                ...c,
                name: userBusinessName,
                revenue: `₹${(userRev / 100000).toFixed(1)}L`,
                customers: userCust
              };
            }
            return c;
          });
          setCompetitors(updated);
          setOpportunities(ci.opportunities || []);
        } else {
          setCompetitors(getCompetitorsForIndustry(userIndustry, userBusinessName));
          setOpportunities(getOpportunitiesForIndustry(userIndustry));
        }
      } catch (e) {
        console.error('Failed to load competitor insights:', e);
        setCompetitors(getCompetitorsForIndustry(userIndustry, userBusinessName));
        setOpportunities(getOpportunitiesForIndustry(userIndustry));
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      loadCompetitors();
    }
  }, [user, userIndustry, userBusinessName]);

  if (loading) {
    return (
      <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div className="spinner" style={{ width: 40, height: 40, borderWidth: 3 }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading Competitor Analysis...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Competitor Analysis</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Industry Segment: <strong>{userIndustry}</strong> · Labeled against local market segments
        </p>
      </div>

      <div className="tabs" style={{ marginBottom: 24 }}>
        {['overview', 'comparison', 'opportunities'].map(t => (
          <button key={t} className={`tab ${activeTab === t ? 'active' : ''}`} onClick={() => setActiveTab(t)} style={{ textTransform: 'capitalize' }}>{t}</button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid-2">
          <div className="card p-6">
            <h2 style={{ fontWeight: 700, marginBottom: 20 }}>📡 Performance Radar</h2>
            <RadarSvg competitors={competitors} />
            <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', marginTop: 8 }}>
              {competitors.map(c => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: c.color }} />
                  <span>{c.isUser ? <strong>{c.name}</strong> : c.name}</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="card p-6">
            <h2 style={{ fontWeight: 700, marginBottom: 16 }}>🎯 Head-to-Head</h2>
            <div style={{ display: 'flex', gap: 16, marginBottom: 20, borderBottom: '1px solid var(--border)', paddingBottom: 12, flexWrap: 'wrap' }}>
              {competitors.map(c => (
                <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem' }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color }} />
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {c.isUser ? <strong>{c.name} (You)</strong> : c.name}
                  </span>
                </div>
              ))}
            </div>
            
            {axisKeys.map((key, i) => (
              <div key={key} style={{ marginBottom: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{axes[i]}</span>
                  <div style={{ display: 'flex', gap: 10 }}>
                    {competitors.map(c => (
                      <span key={c.name} style={{ fontSize: '0.78rem', fontFamily: 'JetBrains Mono', color: c.color, fontWeight: 700 }}>{c.scores[key]}</span>
                    ))}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 2 }}>
                  {competitors.map(c => (
                    <div key={c.name} style={{ flex: 1 }}>
                      <div className="progress-track" style={{ height: 5 }}>
                        <div style={{ height: '100%', width: `${c.scores[key]}%`, background: c.color, borderRadius: 99, transition: 'width 0.8s ease' }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'comparison' && (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Business</th>
                <th>Monthly Revenue</th>
                <th>Customers</th>
                <th>Rating</th>
                {axisKeys.map(k => <th key={k} style={{ textTransform: 'capitalize' }}>{k}</th>)}
              </tr>
            </thead>
            <tbody>
              {competitors.map(c => (
                <tr key={c.name} style={{ background: c.isUser ? 'rgba(var(--accent-primary-rgb),0.04)' : '' }}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: c.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>{c.short}</div>
                      <div>
                        <div style={{ fontWeight: c.isUser ? 700 : 400, fontSize: '0.875rem' }}>{c.name}</div>
                        {c.isUser && <div className="badge badge-primary" style={{ marginTop: 2 }}>You</div>}
                      </div>
                    </div>
                  </td>
                  <td style={{ fontFamily: 'JetBrains Mono' }}>{c.revenue}</td>
                  <td style={{ fontFamily: 'JetBrains Mono' }}>{c.customers}</td>
                  <td><span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700 }}>⭐ {c.rating}</span></td>
                  {axisKeys.map(k => (
                    <td key={k}>
                      <span style={{ fontFamily: 'JetBrains Mono', color: c.isUser ? (c.scores[k] >= 70 ? 'var(--accent-success)' : 'var(--accent-warning)') : 'var(--text-secondary)' }}>
                        {c.scores[k]}
                      </span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'opportunities' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {opportunities.map((op, idx) => (
            <div key={idx} className="card p-6" style={{ background: 'var(--bg-surface)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{op.title}</h3>
                <span className={`badge badge-${op.impact === 'High' ? 'danger' : 'warning'}`}>{op.impact} Impact</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6, marginBottom: 16 }}>{op.desc}</p>
              <div style={{ padding: '12px 16px', background: 'var(--bg-elevated)', borderRadius: 8, borderLeft: '3px solid var(--accent-primary)', fontSize: '0.82rem' }}>
                <strong>Recommended Action:</strong> {op.action}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

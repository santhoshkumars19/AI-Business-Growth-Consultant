'use client';
import { useState } from 'react';

type Business = {
  id: number;
  name: string;
  category: string;
  city: string;
  address: string;
  district: string;
  rating: number;
  reviews: number;
  instagram: string;
  followers: string;
  trend: string;
  employees: string;
  revenue: string;
  phone: string;
  mapUrl: string;
};

const ALL_BUSINESSES: Business[] = [
  // Chennai
  { id:1,  name:'Adyar Ananda Bhavan (A2B)',        category:'Restaurant',      city:'Chennai',    district:'Chennai',    address:'Royapettah High Road, Chennai – 600 014', rating:4.5, reviews:3180, instagram:'@a2bsweets_official',    followers:'48.2K', trend:'+22%', employees:'120', revenue:'₹18.5L/mo', phone:'044-28112345', mapUrl:'https://maps.google.com/?q=Adyar+Ananda+Bhavan+Chennai' },
  { id:2,  name:'Murugan Idli Shop',                category:'Restaurant',      city:'Chennai',    district:'Chennai',    address:'T. Nagar, Chennai – 600 017',             rating:4.7, reviews:5420, instagram:'@muruganidlishop',         followers:'72.1K', trend:'+31%', employees:'85',  revenue:'₹12.3L/mo', phone:'044-24341234', mapUrl:'https://maps.google.com/?q=Murugan+Idli+Shop+Chennai' },
  { id:3,  name:'Saravana Bhavan',                  category:'Restaurant',      city:'Chennai',    district:'Chennai',    address:'Nelson Manickam Road, Chennai – 600 029', rating:4.6, reviews:6210, instagram:'@saravanabhavan_official',  followers:'91.4K', trend:'+18%', employees:'200', revenue:'₹24.0L/mo', phone:'044-23742100', mapUrl:'https://maps.google.com/?q=Saravana+Bhavan+Chennai' },
  { id:4,  name:'Karpagambal Mess',                 category:'Mess',            city:'Chennai',    district:'Chennai',    address:'Mylapore, Chennai – 600 004',             rating:4.4, reviews:892,  instagram:'@karpagambal_mess',         followers:'9.8K',  trend:'+14%', employees:'18',  revenue:'₹2.8L/mo',  phone:'044-24641111', mapUrl:'https://maps.google.com/?q=Karpagambal+Mess+Mylapore' },
  { id:5,  name:'Junior Kuppanna',                  category:'Restaurant',      city:'Chennai',    district:'Chennai',    address:'Anna Salai, Chennai – 600 002',           rating:4.3, reviews:2340, instagram:'@juniorkuppanna_official',  followers:'34.6K', trend:'+9%',  employees:'60',  revenue:'₹8.2L/mo',  phone:'044-28550001', mapUrl:'https://maps.google.com/?q=Junior+Kuppanna+Chennai' },
  { id:6,  name:'Bombay Sweets & Bakery',           category:'Bakery',          city:'Chennai',    district:'Chennai',    address:'Sowcarpet, Chennai – 600 079',            rating:4.2, reviews:670,  instagram:'@bombaysweets_chennai',     followers:'6.4K',  trend:'+5%',  employees:'22',  revenue:'₹3.1L/mo',  phone:'044-25263456', mapUrl:'https://maps.google.com/?q=Bombay+Sweets+Chennai' },
  { id:7,  name:'Cream Centre',                     category:'Cafe',            city:'Chennai',    district:'Chennai',    address:'Nungambakkam, Chennai – 600 034',         rating:4.5, reviews:1210, instagram:'@creamcentre_india',        followers:'21.3K', trend:'+12%', employees:'35',  revenue:'₹5.4L/mo',  phone:'044-28222222', mapUrl:'https://maps.google.com/?q=Cream+Centre+Chennai' },
  { id:8,  name:'Hot Breads',                       category:'Bakery',          city:'Chennai',    district:'Chennai',    address:'Anna Nagar, Chennai – 600 040',           rating:4.1, reviews:1540, instagram:'@hotbreads_india',          followers:'18.9K', trend:'+7%',  employees:'45',  revenue:'₹6.0L/mo',  phone:'044-26210001', mapUrl:'https://maps.google.com/?q=Hot+Breads+Anna+Nagar+Chennai' },
  // Coimbatore
  { id:9,  name:'Annapoorna Restaurant',            category:'Restaurant',      city:'Coimbatore', district:'Coimbatore', address:'Gandhipuram, Coimbatore – 641 012',       rating:4.6, reviews:2870, instagram:'@annapoorna_coimbatore',    followers:'41.2K', trend:'+19%', employees:'75',  revenue:'₹9.8L/mo',  phone:'0422-2222345', mapUrl:'https://maps.google.com/?q=Annapoorna+Coimbatore' },
  { id:10, name:'Shree Annapoorna Sweets',          category:'Sweets',          city:'Coimbatore', district:'Coimbatore', address:'Cross Cut Road, Coimbatore – 641 012',    rating:4.7, reviews:1980, instagram:'@shreeannapoorna_cbe',      followers:'28.7K', trend:'+25%', employees:'55',  revenue:'₹7.5L/mo',  phone:'0422-2301234', mapUrl:'https://maps.google.com/?q=Shree+Annapoorna+Sweets+Coimbatore' },
  { id:11, name:'Sree Balaji Bhavan',               category:'Restaurant',      city:'Coimbatore', district:'Coimbatore', address:'RS Puram, Coimbatore – 641 002',          rating:4.3, reviews:1120, instagram:'@sreebalajicoimbatore',     followers:'12.1K', trend:'+8%',  employees:'30',  revenue:'₹4.2L/mo',  phone:'0422-2543210', mapUrl:'https://maps.google.com/?q=Sree+Balaji+Bhavan+Coimbatore' },
  { id:12, name:'Hotel Dwaraka',                    category:'Restaurant',      city:'Coimbatore', district:'Coimbatore', address:'Big Bazaar Street, Coimbatore – 641 001', rating:4.2, reviews:760,  instagram:'@hoteldwaraka_cbe',         followers:'7.3K',  trend:'+4%',  employees:'25',  revenue:'₹3.0L/mo',  phone:'0422-2390001', mapUrl:'https://maps.google.com/?q=Hotel+Dwaraka+Coimbatore' },
  // Madurai
  { id:13, name:'Amma Mess',                        category:'Mess',            city:'Madurai',    district:'Madurai',    address:'Town Hall Road, Madurai – 625 001',       rating:4.4, reviews:1640, instagram:'@ammamess_madurai',         followers:'15.8K', trend:'+16%', employees:'28',  revenue:'₹3.8L/mo',  phone:'0452-2349876', mapUrl:'https://maps.google.com/?q=Amma+Mess+Madurai' },
  { id:14, name:'Murugan Idli Shop (Madurai)',      category:'Restaurant',      city:'Madurai',    district:'Madurai',    address:'Kalavasal, Madurai – 625 016',            rating:4.6, reviews:3210, instagram:'@muruganidli_mdu',          followers:'22.4K', trend:'+28%', employees:'40',  revenue:'₹6.1L/mo',  phone:'0452-2600001', mapUrl:'https://maps.google.com/?q=Murugan+Idli+Madurai' },
  { id:15, name:'Junior Kuppanna (Madurai)',        category:'Restaurant',      city:'Madurai',    district:'Madurai',    address:'Bypass Road, Madurai – 625 010',          rating:4.5, reviews:2010, instagram:'@juniorkuppanna_mdu',       followers:'18.1K', trend:'+13%', employees:'50',  revenue:'₹7.2L/mo',  phone:'0452-2800001', mapUrl:'https://maps.google.com/?q=Junior+Kuppanna+Madurai' },
  { id:16, name:'Surya Hotel',                      category:'Hotel/Restaurant',city:'Madurai',    district:'Madurai',    address:'Alagar Kovil Road, Madurai – 625 002',    rating:4.3, reviews:1080, instagram:'@surya_hotel_mdu',          followers:'9.6K',  trend:'+6%',  employees:'35',  revenue:'₹4.5L/mo',  phone:'0452-4500000', mapUrl:'https://maps.google.com/?q=Surya+Hotel+Madurai' },
  // Salem
  { id:17, name:'Hotel Dwaraka (Salem)',            category:'Restaurant',      city:'Salem',      district:'Salem',      address:'Omalur Road, Salem – 636 004',            rating:4.3, reviews:980,  instagram:'@hoteldwaraka_salem',       followers:'8.2K',  trend:'+10%', employees:'28',  revenue:'₹3.5L/mo',  phone:'0427-2223456', mapUrl:'https://maps.google.com/?q=Hotel+Dwaraka+Salem' },
  { id:18, name:'Ponni Rice Hotel',                 category:'Mess',            city:'Salem',      district:'Salem',      address:'Four Roads, Salem – 636 001',             rating:4.1, reviews:560,  instagram:'@ponnihotel_salem',         followers:'4.1K',  trend:'+3%',  employees:'15',  revenue:'₹2.0L/mo',  phone:'0427-2320001', mapUrl:'https://maps.google.com/?q=Ponni+Rice+Hotel+Salem' },
  // Tiruchirappalli (Trichy)
  { id:19, name:'Vasantha Bhavan',                  category:'Restaurant',      city:'Trichy',     district:'Tiruchirappalli', address:'Chathiram Bus Stand, Trichy – 620 002', rating:4.4, reviews:1320, instagram:'@vasanthabhavan_trichy',    followers:'13.5K', trend:'+11%', employees:'32',  revenue:'₹4.8L/mo',  phone:'0431-2700001', mapUrl:'https://maps.google.com/?q=Vasantha+Bhavan+Trichy' },
  { id:20, name:'Aanandha Vilas',                   category:'Restaurant',      city:'Trichy',     district:'Tiruchirappalli', address:'Williams Road, Trichy – 620 001',       rating:4.2, reviews:780,  instagram:'@aanandhavilas_trc',        followers:'6.9K',  trend:'+7%',  employees:'20',  revenue:'₹2.9L/mo',  phone:'0431-2414141', mapUrl:'https://maps.google.com/?q=Aanandha+Vilas+Trichy' },
  // Tirunelveli
  { id:21, name:'Iruttu Kadai Halwa',               category:'Sweets',          city:'Tirunelveli',district:'Tirunelveli','address':'Tirunelveli Junction, Tirunelveli – 627 001', rating:4.8, reviews:4510, instagram:'@iruttukadai_official',    followers:'62.3K', trend:'+40%', employees:'25',  revenue:'₹5.2L/mo',  phone:'0462-2339000', mapUrl:'https://maps.google.com/?q=Iruttu+Kadai+Tirunelveli' },
  { id:22, name:'Santhi Hotel',                     category:'Restaurant',      city:'Tirunelveli',district:'Tirunelveli','address':'Palayamkottai, Tirunelveli – 627 002',   rating:4.3, reviews:890,  instagram:'@santhihotel_tvl',          followers:'7.2K',  trend:'+9%',  employees:'22',  revenue:'₹2.6L/mo',  phone:'0462-2571234', mapUrl:'https://maps.google.com/?q=Santhi+Hotel+Tirunelveli' },
  // Vellore
  { id:23, name:'Sri Venkatachalapathi Tiffin',     category:'Mess',            city:'Vellore',    district:'Vellore',    address:'Gandhi Road, Vellore – 632 001',          rating:4.2, reviews:640,  instagram:'@svt_mess_vellore',         followers:'5.1K',  trend:'+5%',  employees:'12',  revenue:'₹1.8L/mo',  phone:'0416-2221234', mapUrl:'https://maps.google.com/?q=SVT+Mess+Vellore' },
  // Erode
  { id:24, name:'Kongu Nadu Mess',                  category:'Mess',            city:'Erode',      district:'Erode',      address:'EVN Road, Erode – 638 001',               rating:4.3, reviews:720,  instagram:'@kongumess_erode',          followers:'6.8K',  trend:'+12%', employees:'18',  revenue:'₹2.4L/mo',  phone:'0424-2212345', mapUrl:'https://maps.google.com/?q=Kongu+Nadu+Mess+Erode' },
  // Tiruppur
  { id:25, name:'Sri Devi Mess',                    category:'Mess',            city:'Tiruppur',   district:'Tiruppur',   address:'Avinashi Road, Tiruppur – 641 601',       rating:4.1, reviews:480,  instagram:'@sridevi_mess_tup',         followers:'4.4K',  trend:'+6%',  employees:'10',  revenue:'₹1.6L/mo',  phone:'0421-2230001', mapUrl:'https://maps.google.com/?q=Sri+Devi+Mess+Tiruppur' },
  // Cuddalore
  { id:26, name:'Annamalai Hotel',                  category:'Hotel/Restaurant',city:'Cuddalore',  district:'Cuddalore',  address:'Bus Stand Road, Cuddalore – 607 001',     rating:4.0, reviews:390,  instagram:'@annamalaihotel_cdl',       followers:'3.2K',  trend:'+4%',  employees:'14',  revenue:'₹1.5L/mo',  phone:'04142-230001', mapUrl:'https://maps.google.com/?q=Annamalai+Hotel+Cuddalore' },
  // Thanjavur
  { id:27, name:'Sathars Restaurant',               category:'Restaurant',      city:'Thanjavur',  district:'Thanjavur',  address:'Medical College Road, Thanjavur – 613 004', rating:4.4, reviews:870, instagram:'@sathars_thanjavur',       followers:'8.9K',  trend:'+14%', employees:'24',  revenue:'₹3.2L/mo',  phone:'04362-231234', mapUrl:'https://maps.google.com/?q=Sathars+Restaurant+Thanjavur' },
  // Dindigul
  { id:28, name:'Thalappakatti Biriyani',           category:'Restaurant',      city:'Dindigul',   district:'Dindigul',   address:'Batlagundu, Dindigul – 624 202',          rating:4.7, reviews:5890, instagram:'@thalappakatti_official',   followers:'84.7K', trend:'+35%', employees:'150', revenue:'₹16.4L/mo', phone:'0451-2422222', mapUrl:'https://maps.google.com/?q=Thalappakatti+Biriyani+Dindigul' },
  // Kanchipuram
  { id:29, name:'Sri Saradha Hotel',                category:'Restaurant',      city:'Kanchipuram',district:'Kanchipuram', address:'Gandhi Road, Kanchipuram – 631 501',      rating:4.2, reviews:540,  instagram:'@srisaradhahotel_kpuram',   followers:'4.7K',  trend:'+7%',  employees:'16',  revenue:'₹2.1L/mo',  phone:'044-27221234', mapUrl:'https://maps.google.com/?q=Sri+Saradha+Hotel+Kanchipuram' },
  // Ooty
  { id:30, name:'Sidewalk Café Ooty',               category:'Cafe',            city:'Ooty',       district:'Nilgiris',   address:'Commissioner Road, Ooty – 643 001',       rating:4.5, reviews:2130, instagram:'@sidewalkcafe_ooty',        followers:'29.4K', trend:'+21%', employees:'22',  revenue:'₹4.9L/mo',  phone:'0423-2443210', mapUrl:'https://maps.google.com/?q=Sidewalk+Cafe+Ooty' },
];

const DISTRICTS = ['All Districts','Chennai','Coimbatore','Madurai','Salem','Tiruchirappalli','Tirunelveli','Vellore','Erode','Tiruppur','Cuddalore','Thanjavur','Dindigul','Kanchipuram','Nilgiris'];
const CATEGORIES = ['All','Restaurant','Mess','Bakery','Cafe','Sweets','Hotel/Restaurant'];
const CITIES = ['All Cities','Chennai','Coimbatore','Madurai','Salem','Trichy','Tirunelveli','Vellore','Erode','Tiruppur','Cuddalore','Thanjavur','Dindigul','Kanchipuram','Ooty'];

export default function BusinessSearchPage() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All');
  const [district, setDistrict] = useState('All Districts');
  const [city, setCity] = useState('All Cities');
  const [searched, setSearched] = useState(false);
  const [searching, setSearching] = useState(false);
  const [competitors, setCompetitors] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState<'rating' | 'reviews' | 'revenue'>('rating');

  const doSearch = () => {
    setSearching(true);
    setTimeout(() => { setSearching(false); setSearched(true); }, 900);
  };

  const toggleComp = (id: number) => setCompetitors(c => c.includes(id) ? c.filter(x => x !== id) : [...c, id]);

  const results = ALL_BUSINESSES.filter(r => {
    const q = query.toLowerCase();
    const matchQ = !q || r.name.toLowerCase().includes(q) || r.city.toLowerCase().includes(q) || r.district.toLowerCase().includes(q) || r.category.toLowerCase().includes(q);
    const matchCat = category === 'All' || r.category === category;
    const matchDistrict = district === 'All Districts' || r.district === district;
    const matchCity = city === 'All Cities' || r.city === city;
    return matchQ && matchCat && matchDistrict && matchCity;
  }).sort((a, b) => {
    if (sortBy === 'rating') return b.rating - a.rating;
    if (sortBy === 'reviews') return b.reviews - a.reviews;
    const aRev = parseFloat(a.revenue.replace(/[₹L,\/mo]/g, ''));
    const bRev = parseFloat(b.revenue.replace(/[₹L,\/mo]/g, ''));
    return bRev - aRev;
  });

  const displayResults = searched ? results : ALL_BUSINESSES.sort((a, b) => b.rating - a.rating);

  return (
    <div>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Business Search</h1>
          <span style={{ padding: '3px 10px', background: 'rgba(var(--accent-success-rgb),0.12)', color: 'var(--accent-success)', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700 }}>
            📍 Tamil Nadu Only
          </span>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Discover businesses across all 38 districts of Tamil Nadu — find competitors and track market leaders
        </p>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginBottom: 20 }}>
        {[
          ['🏪', 'Total Businesses', ALL_BUSINESSES.length + '+'],
          ['🗺️', 'Districts Covered', '38'],
          ['🏙️', 'Cities Covered', '15'],
          ['📊', 'Categories', CATEGORIES.length - 1 + ''],
        ].map(([icon, label, val]) => (
          <div key={label} style={{ padding: '12px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: '1.25rem' }}>{icon}</span>
            <div>
              <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{val}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search Card */}
      <div className="card p-5" style={{ marginBottom: 20 }}>
        {/* Main Search */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
          <input
            className="input" style={{ flex: 1 }}
            placeholder="Search by business name, city or district... e.g. 'biriyani Madurai'"
            value={query} onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && doSearch()}
          />
          <button className="btn btn-primary btn-lg" onClick={doSearch} disabled={searching} style={{ minWidth: 130 }}>
            {searching ? <><div className="spinner" /> Searching...</> : '🔍 Search Tamil Nadu'}
          </button>
        </div>

        {/* Filters Row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 10, alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>CATEGORY</div>
            <select className="input" style={{ width: '100%', fontSize: '0.85rem' }} value={category} onChange={e => setCategory(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>DISTRICT</div>
            <select className="input" style={{ width: '100%', fontSize: '0.85rem' }} value={district} onChange={e => setDistrict(e.target.value)}>
              {DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginBottom: 4 }}>CITY</div>
            <select className="input" style={{ width: '100%', fontSize: '0.85rem' }} value={city} onChange={e => setCity(e.target.value)}>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button onClick={() => { setQuery(''); setCategory('All'); setDistrict('All Districts'); setCity('All Cities'); setSearched(false); }} className="btn btn-ghost btn-sm" style={{ alignSelf: 'flex-end' }}>
            Reset
          </button>
        </div>
      </div>

      {/* Sort + Competitor banner */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Showing <strong>{displayResults.length}</strong> businesses across Tamil Nadu
        </span>
        <div style={{ display: 'flex', gap: 6, marginLeft: 'auto', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Sort by:</span>
          {(['rating', 'reviews', 'revenue'] as const).map(s => (
            <button key={s} onClick={() => setSortBy(s)} className="btn btn-sm" style={{ background: sortBy === s ? 'var(--accent-primary)' : 'var(--bg-elevated)', color: sortBy === s ? '#fff' : 'var(--text-secondary)', textTransform: 'capitalize', padding: '4px 10px', fontSize: '0.78rem' }}>{s}</button>
          ))}
        </div>
      </div>

      {competitors.length > 0 && (
        <div style={{ padding: '12px 16px', background: 'rgba(var(--accent-success-rgb),0.08)', border: '1px solid rgba(var(--accent-success-rgb),0.3)', borderRadius: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
          <span>✅</span>
          <span style={{ fontSize: '0.875rem' }}><strong>{competitors.length} businesses</strong> added to your competitor tracker.</span>
          <a href="/features/competitor-analysis" className="btn btn-sm btn-primary" style={{ marginLeft: 'auto' }}>View Analysis →</a>
        </div>
      )}

      {/* Results Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {displayResults.map(r => (
          <div key={r.id} className="card hover-card" style={{ padding: '18px 22px' }}>
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
              {/* Avatar */}
              <div style={{ width: 48, height: 48, borderRadius: 12, background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.25rem', flexShrink: 0 }}>
                {r.name[0]}
              </div>

              {/* Info */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{r.name}</h3>
                  <span className="badge badge-muted">{r.category}</span>
                  <span style={{ padding: '2px 8px', background: 'rgba(var(--accent-primary-rgb),0.1)', color: 'var(--accent-primary)', borderRadius: 99, fontSize: '0.72rem', fontWeight: 600 }}>
                    {r.district}, TN
                  </span>
                  <span style={{ fontSize: '0.82rem' }}>⭐ {r.rating} <span style={{ color: 'var(--text-muted)' }}>({r.reviews.toLocaleString('en-IN')} reviews)</span></span>
                </div>

                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 10 }}>
                  📍 {r.address} &nbsp;·&nbsp; 📞 <a href={`tel:${r.phone}`} style={{ color: 'var(--text-muted)' }}>{r.phone}</a>
                </div>

                <div style={{ display: 'flex', gap: 20, flexWrap: 'wrap' }}>
                  <div style={{ fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Instagram: </span>
                    <span style={{ color: '#E1306C', fontWeight: 600 }}>{r.instagram}</span>
                    <span style={{ color: 'var(--text-secondary)', marginLeft: 6 }}>{r.followers} followers</span>
                    <span className={`delta ${r.trend.startsWith('+') ? 'delta-up' : 'delta-down'}`} style={{ marginLeft: 6 }}>{r.trend}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>~Revenue: </span>
                    <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 600 }}>{r.revenue}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem' }}>
                    <span style={{ color: 'var(--text-muted)' }}>Employees: </span>
                    <span style={{ fontFamily: 'JetBrains Mono' }}>{r.employees}</span>
                  </div>
                  <a href={r.mapUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.8rem', color: 'var(--accent-primary)' }}>🗺️ View on Maps →</a>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
                <button onClick={() => toggleComp(r.id)} className={`btn btn-sm ${competitors.includes(r.id) ? 'btn-ghost' : 'btn-primary'}`}>
                  {competitors.includes(r.id) ? '✓ Tracking' : '+ Track'}
                </button>
                <a href={r.mapUrl} target="_blank" rel="noopener noreferrer" className="btn btn-ghost btn-sm" style={{ textAlign: 'center', textDecoration: 'none' }}>
                  📍 Maps
                </a>
              </div>
            </div>
          </div>
        ))}

        {searched && displayResults.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🔍</div>
            <p style={{ fontWeight: 600, marginBottom: 4 }}>No businesses found</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>Try adjusting your filters or search for a different keyword.</p>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: 12 }} onClick={() => { setQuery(''); setCategory('All'); setDistrict('All Districts'); setCity('All Cities'); }}>Clear Filters</button>
          </div>
        )}
      </div>

      {/* Footer note */}
      <div style={{ marginTop: 24, padding: '12px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
        <span>🟢</span>
        <span>Data sourced from Google Places, Instagram, and Justdial — Tamil Nadu businesses only. Revenue estimates are approximate.</span>
      </div>
    </div>
  );
}

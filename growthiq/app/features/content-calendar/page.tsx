'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const platforms = ['Instagram', 'Facebook', 'X (Twitter)', 'YouTube'];
const platformColors: Record<string, string> = { Instagram: '#E1306C', Facebook: '#1877F2', 'X (Twitter)': '#1DA1F2', YouTube: '#FF0000' };

type Post = {
  id: number;
  day: number;
  platform: string;
  time: string;
  caption: string;
  hashtags: string;
  type: string;
  approved: boolean;
};

// Industry Post Plan Generator
function getPostsForIndustry(industry: string, businessName: string): Post[] {
  const norm = (industry || '').toLowerCase();
  
  if (norm.includes('pharmacy') || norm.includes('medical') || norm.includes('health')) {
    return [
      { id: 1, day: 1, platform: 'Instagram', time: '6:00 PM', caption: `🌡️ Managing seasonal allergies? Try these 3 simple wellness tips. Swing by ${businessName} for personalized health advice! 💊`, hashtags: '#Pharmacy #WellnessTips #HealthLife #LocalCare', type: 'Educational', approved: false },
      { id: 2, day: 3, platform: 'Facebook', time: '11:00 AM', caption: `Need your prescriptions filled? We stock all major medicines and offer quick home delivery. Simply WhatsApp your list to order! 📦`, hashtags: '#MedicineDelivery #PharmacySupport #PrescriptionRefill', type: 'Promotional', approved: false },
      { id: 3, day: 7, platform: 'Instagram', time: '7:00 PM', caption: `Behind the scenes: Watch how our licensed pharmacists verify and double-check prescriptions for absolute safety and care. 🛡️`, hashtags: '#BehindTheScenes #PharmacistLife #PatientSafety #Healthcare', type: 'Reel/Video', approved: true },
      { id: 4, day: 10, platform: 'X (Twitter)', time: '9:00 AM', caption: `Flu season is starting. Protect your family by getting your annual flu shot early. No appointments needed at ${businessName}! 💉`, hashtags: '#FluVaccine #StayHealthy #WellnessAlert', type: 'Announcement', approved: false },
      { id: 5, day: 14, platform: 'Instagram', time: '5:00 PM', caption: `⭐ Customer Testimonial: 'Best pharmacy service in town. They always go out of their way to find hard-to-get medicines!' Thank you for your trust! 💕`, hashtags: '#CustomerLove #PatientCare #PharmacyFamily #TamilNadu', type: 'User Generated', approved: false },
      { id: 6, day: 18, platform: 'YouTube', time: '4:00 PM', caption: `NEW VIDEO: Generics vs. Brand Name Medicines — What's the real difference in cost and efficacy? 🎬 Watch now (link in bio)`, hashtags: '#HealthcareGuide #GenericDrugs #SaveOnMedication', type: 'YouTube', approved: false },
      { id: 7, day: 21, platform: 'Instagram', time: '7:00 PM', caption: `🎉 Free Health Screening: Join us this Sunday morning at our store for free blood pressure and blood sugar checks. Share with your family! 🩺`, hashtags: '#FreeHealthCamp #CommunityWellbeing #HealthChecks', type: 'Campaign', approved: true },
      { id: 8, day: 25, platform: 'Facebook', time: '12:00 PM', caption: `Keep your family safe: 3 simple guidelines to store medicines safely at home, away from moisture and out of children's reach. 🏡`, hashtags: '#MedicineSafety #HomeTips #FamilyCare #FirstAid', type: 'Educational', approved: false },
    ];
  }

  if (norm.includes('retail') || norm.includes('fashion') || norm.includes('clothing') || norm.includes('apparel') || norm.includes('shop')) {
    return [
      { id: 1, day: 1, platform: 'Instagram', time: '6:00 PM', caption: `✨ Upgrade your wardrobe for the season! Check out our new sustainable arrivals in organic cotton at ${businessName} 👗`, hashtags: '#FashionLooks #SustainableStyle #NewArrivals #OOTD', type: 'Promotional', approved: false },
      { id: 2, day: 3, platform: 'Facebook', time: '11:00 AM', caption: `Curating the perfect outfit? Watch our stylist match three simple classic pieces for an elegant office wear look! 👔`, hashtags: '#StylingTips #OfficeLook #WardrobeHacks', type: 'Educational', approved: false },
      { id: 3, day: 7, platform: 'Instagram', time: '7:00 PM', caption: `Behind the scenes: Unboxing the newest apparel styles of the week! Comment below with your favorite color block option. 🔥`, hashtags: '#Unboxing #BoutiqueLife #FashionLaunch #Trends', type: 'Reel/Video', approved: true },
      { id: 4, day: 10, platform: 'X (Twitter)', time: '9:00 AM', caption: `PSA: Our handwoven linen shirts are launching this Friday morning. Limited stock available! 🚨 #SustainableFashion #LinenLove`, hashtags: '#Trends #ClothingBrand', type: 'Announcement', approved: false },
      { id: 5, day: 14, platform: 'Instagram', time: '5:00 PM', caption: `⭐ Style Spotlight: Customer Shalini looks absolutely stunning in our Indigo Wrap Dress! Tag us to get featured! 💕`, hashtags: '#CustomerStyle #BoutiqueLove #FashionFamily #CommunityStyle', type: 'User Generated', approved: false },
      { id: 6, day: 18, platform: 'YouTube', time: '4:00 PM', caption: `NEW VIDEO: 5 Quick Wardrobe Styling Secrets to Mix & Match sustainable pieces like a pro 🎬 Watch now!`, hashtags: '#StylingGuide #MixAndMatch #SustainableWear', type: 'YouTube', approved: false },
      { id: 7, day: 21, platform: 'Instagram', time: '7:00 PM', caption: `🎉 Refer a friend to ${businessName} and both of you get 15% off your next purchase! DM us "STYLE" to get your code.`, hashtags: '#ReferralDiscount #StyleCommunity #FashionRewards', type: 'Campaign', approved: true },
      { id: 8, day: 25, platform: 'Facebook', time: '12:00 PM', caption: `Weekend Special: Get an extra 10% discount when you buy any two accessories this Saturday and Sunday. 🛍️`, hashtags: '#WeekendSale #AccessoriesDiscount #ShoppingDeals', type: 'Promotional', approved: false },
    ];
  }

  // Default Bakery / Cafe Fallback
  return [
    { id: 1, day: 1, platform: 'Instagram', time: '6:00 PM', caption: `☀️ July is here! Beat the heat with our fresh summer menu at ${businessName}. Come in and treat yourself today 🧁`, hashtags: '#MumbaiBakery #SummerVibes #BloomBakery #FoodLover', type: 'Promotional', approved: false },
    { id: 2, day: 3, platform: 'Facebook', time: '11:00 AM', caption: `Did you know? We bake fresh every morning starting at 5 AM 🥐 That's 200+ items before you've had your first coffee!`, hashtags: '#FreshBaked #MumbaiFood #LocalBusiness', type: 'Educational', approved: false },
    { id: 3, day: 7, platform: 'Instagram', time: '7:00 PM', caption: `Behind the scenes: Watch how our signature croissants come to life! 🔥 From dough to golden perfection in 45 minutes.`, hashtags: '#BehindTheScenes #BakeryLife #Croissant #FoodReel', type: 'Reel/Video', approved: true },
    { id: 4, day: 10, platform: 'X (Twitter)', time: '9:00 AM', caption: `PSA: Our chocolate croissants sell out by noon every day. Set your alarm 🚨 #EarlyBird #ChocolateCroissant #Mumbai`, hashtags: '#MumbaiFood #Bakery', type: 'Announcement', approved: false },
    { id: 5, day: 14, platform: 'Instagram', time: '5:00 PM', caption: `⭐ Customer of the Month: Meera has been visiting ${businessName} every week for 2 years! Thank you for your loyalty 💕`, hashtags: '#CustomerLove #LoyalCustomers #BloomBakery #Community', type: 'User Generated', approved: false },
    { id: 6, day: 18, platform: 'YouTube', time: '4:00 PM', caption: `NEW VIDEO: We tested 5 Mumbai bakeries including ours — honest review inside! 🎬 Watch now (link in bio)`, hashtags: '#MumbaiBakeries #FoodReview #BloomBakery', type: 'YouTube', approved: false },
    { id: 7, day: 21, platform: 'Instagram', time: '7:00 PM', caption: `🎉 BIG ANNOUNCEMENT: Refer a friend to ${businessName} and both of you get ₹200 off! DM us "REFER" to get your unique code.`, hashtags: '#ReferralProgram #BloomBakery #Mumbai #GetRewards', type: 'Campaign', approved: true },
    { id: 8, day: 25, platform: 'Facebook', time: '12:00 PM', caption: `Weekend Special 🥖: Free coffee with any purchase above ₹300 this Saturday & Sunday only! Come in and say "WEEKEND"`, hashtags: '#WeekendSpecial #FreeCoffee #Mumbai #FoodDeals', type: 'Promotional', approved: false },
  ];
}

export default function ContentCalendarPage() {
  const { user } = useAuth();
  
  const userIndustry = user?.businessData?.industry || 'Food & Beverage';
  const userBusinessName = user?.businessData?.business_name || 'Your Business';

  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [view, setView] = useState<'month' | 'list'>('month');
  const [activePlatform, setActivePlatform] = useState('All');

  useEffect(() => {
    const list = getPostsForIndustry(userIndustry, userBusinessName);
    setPosts(list);
    if (list.length > 0) {
      setSelectedPost(list.find(p => p.day === 7) || list[0]);
    }
  }, [userIndustry, userBusinessName]);

  const toggleApprove = (id: number) => {
    setPosts(prev => prev.map(p => p.id === id ? { ...p, approved: !p.approved } : p));
    if (selectedPost?.id === id) {
      setSelectedPost(prev => prev ? { ...prev, approved: !prev.approved } : null);
    }
  };

  const days = Array.from({ length: 30 }, (_, i) => i + 1);
  const filtered = activePlatform === 'All' ? posts : posts.filter(p => p.platform === activePlatform);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 4 }}>Social Media Content Calendar</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
            AI-generated content plan for <strong>{userBusinessName}</strong> ({userIndustry})
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {(['month', 'list'] as const).map(v => (
            <button key={v} onClick={() => setView(v)} className="btn btn-sm" style={{ background: view === v ? 'var(--accent-primary)' : 'var(--bg-elevated)', color: view === v ? '#fff' : 'var(--text-secondary)', textTransform: 'capitalize' }}>{v}</button>
          ))}
          <button className="btn btn-primary btn-sm">🤖 Generate August Plan</button>
        </div>
      </div>

      {/* Platform filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['All', ...platforms].map(p => (
          <button key={p} onClick={() => setActivePlatform(p)} className="btn btn-sm" style={{ background: activePlatform === p ? (platformColors[p] || 'var(--accent-primary)') : 'var(--bg-elevated)', color: activePlatform === p ? '#fff' : 'var(--text-secondary)', borderColor: activePlatform === p ? (platformColors[p] || 'var(--accent-primary)') : 'var(--border)' }}>{p}</button>
        ))}
      </div>

      {/* Stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {[['📝', 'Total Posts', filtered.length], ['✅', 'Approved', filtered.filter(p => p.approved).length], ['⏳', 'Pending', filtered.filter(p => !p.approved).length], ['📅', 'Days Covered', new Set(filtered.map(p => p.day)).size]].map(([icon, label, val]) => (
          <div key={String(label)} style={{ padding: '12px 16px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: '1.25rem', marginBottom: 4 }}>{icon}</div>
            <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: '1.25rem' }}>{val}</div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: selectedPost ? '1fr 380px' : '1fr', gap: 20 }}>
        {view === 'month' ? (
          <div className="card p-4">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, marginBottom: 4 }}>
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => <div key={i} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, color: 'var(--text-muted)', padding: '4px 0' }}>{d}</div>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
              {[...Array(2)].map((_, i) => <div key={`e${i}`} />)}
              {days.map(d => {
                const dayPosts = filtered.filter(p => p.day === d);
                const isSelected = selectedPost?.day === d;
                return (
                  <div key={d} onClick={() => { const first = dayPosts[0]; setSelectedPost(first || null); }} className="calendar-day" style={{ minHeight: 64, borderColor: isSelected ? 'var(--accent-primary)' : dayPosts.length ? 'rgba(var(--accent-primary-rgb),0.3)' : 'var(--border)', background: isSelected ? 'rgba(var(--accent-primary-rgb),0.08)' : 'var(--bg-surface)' }}>
                    <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>{d}</div>
                    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      {dayPosts.map(p => (
                        <div key={p.id} style={{ width: 8, height: 8, borderRadius: '50%', background: platformColors[p.platform] || 'var(--accent-primary)', opacity: p.approved ? 1 : 0.5 }} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.sort((a, b) => a.day - b.day).map(p => (
              <div key={p.id} onClick={() => setSelectedPost(p)} className="card hover-card" style={{ padding: '14px 18px', cursor: 'pointer', borderLeft: `4px solid ${platformColors[p.platform]}`, opacity: p.approved ? 1 : 0.85 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: 99, background: platformColors[p.platform] + '20', color: platformColors[p.platform] }}>{p.platform}</span>
                  <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>July {p.day} · {p.time}</span>
                  <span style={{ marginLeft: 'auto', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-elevated)', padding: '2px 8px', borderRadius: 99 }}>{p.type}</span>
                  {p.approved && <span style={{ fontSize: '0.72rem', color: 'var(--accent-success)', fontWeight: 700 }}>✅</span>}
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>{p.caption.slice(0, 100)}...</p>
              </div>
            ))}
          </div>
        )}

        {/* Detail Panel */}
        {selectedPost && (
          <div className="card p-5">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ fontWeight: 700 }}>Post Details</h3>
              <button onClick={() => setSelectedPost(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: '1.25rem' }}>×</button>
            </div>
            <div style={{ display: 'flex', gap: 8, marginBottom: 14 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '3px 10px', borderRadius: 99, background: platformColors[selectedPost.platform], color: '#fff' }}>{selectedPost.platform}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', padding: '3px 10px', background: 'var(--bg-elevated)', borderRadius: 99 }}>July {selectedPost.day} · {selectedPost.time}</span>
            </div>
            <div style={{ background: 'var(--bg-elevated)', borderRadius: 12, padding: '14px 16px', marginBottom: 14 }}>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.7, marginBottom: 10 }}>{selectedPost.caption}</p>
              <p style={{ fontSize: '0.78rem', color: platformColors[selectedPost.platform], lineHeight: 1.8 }}>{selectedPost.hashtags}</p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
              <div style={{ padding: '8px 12px', background: 'rgba(var(--accent-primary-rgb),0.08)', borderRadius: 8, fontSize: '0.78rem' }}>⏰ {selectedPost.time}</div>
              <div style={{ padding: '8px 12px', background: 'rgba(var(--accent-success-rgb),0.08)', borderRadius: 8, fontSize: '0.78rem' }}>📊 {selectedPost.type}</div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => toggleApprove(selectedPost.id)} className={`btn ${selectedPost.approved ? 'btn-ghost' : 'btn-primary'} btn-sm`} style={{ flex: 1 }}>
                {selectedPost.approved ? '↩ Unapprove' : '✅ Approve'}
              </button>
              <button className="btn btn-ghost btn-sm" style={{ flex: 1 }}>✏️ Edit</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

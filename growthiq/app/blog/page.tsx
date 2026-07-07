'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

const BLOG_POSTS = [
  {
    title: 'How to double your restaurant tables turnover in Tamil Nadu',
    category: 'Operations',
    readTime: '5 min read',
    date: 'July 1, 2026',
    desc: 'Simple table setup optimizations, booking windows, and payment triggers that can help small restaurants increase guest capacity and table turnover rate.',
    icon: '🍽️',
  },
  {
    title: 'Maximising Instagram Marketing ROI for Local Shops',
    category: 'Marketing',
    readTime: '6 min read',
    date: 'June 24, 2026',
    desc: 'Unlocking location-based tags, regional language options, and budget ad structures to target consumers in a 5km radius with high conversion ratios.',
    icon: '📸',
  },
  {
    title: 'Understanding GST composition scheme rules for retail businesses',
    category: 'Finance',
    readTime: '4 min read',
    date: 'June 18, 2026',
    desc: 'A complete small business owner guide to choosing between standard GST registration and composition scheme options to protect margins.',
    icon: '💼',
  },
  {
    title: 'Building a Customer Loyalty Program from scratch',
    category: 'Strategy',
    readTime: '8 min read',
    date: 'June 10, 2026',
    desc: 'A step-by-step breakdown on designing a repeat customer reward structure via simple automated WhatsApp tools, boosting repeat retention by 2x.',
    icon: '⭐',
  }
];

export default function BlogPage() {
  const { theme, toggle } = useTheme();
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All' 
    ? BLOG_POSTS 
    : BLOG_POSTS.filter(p => p.category === activeCategory);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>
      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 200,
        padding: '0 24px', height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border)',
        backdropFilter: 'blur(16px)',
      }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem' }}>⚡</div>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.25rem', color: 'var(--text-primary)' }}>GrowthIQ<span style={{ color: 'var(--accent-primary)' }}> AI</span></span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/pricing" style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Pricing</Link>
          <button onClick={toggle} className="btn btn-ghost btn-sm" style={{ fontSize: '1rem' }}>{theme === 'dark' ? '☀️' : '🌙'}</button>
          <Link href="/auth/login" className="btn btn-ghost btn-sm">Sign In</Link>
          <Link href="/auth/register" className="btn btn-primary btn-sm">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '60px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 800, margin: '0 auto' }}>
          <div className="badge badge-primary" style={{ marginBottom: 16 }}>GrowthIQ Blog</div>
          <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(2rem, 3.5vw, 3rem)', fontWeight: 800, marginBottom: 14 }}>
            Knowledge Hub for <span className="gradient-text">Small Businesses</span>
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>Practical tips, regulatory updates, and strategic guides written specifically for Indian entrepreneurs.</p>
        </div>
      </section>

      {/* Blog Feed */}
      <section className="section" style={{ background: 'var(--bg-elevated)', paddingTop: 40 }}>
        <div className="container" style={{ maxWidth: 900 }}>
          {/* Category Filter */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
            {['All', 'Marketing', 'Operations', 'Finance', 'Strategy'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className="btn btn-sm"
                style={{
                  background: activeCategory === cat ? 'var(--accent-primary)' : 'var(--bg-surface)',
                  color: activeCategory === cat ? '#fff' : 'var(--text-secondary)',
                  border: `1px solid ${activeCategory === cat ? 'var(--accent-primary)' : 'var(--border)'}`
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {filtered.map((post, idx) => (
              <div key={idx} className="card p-6" style={{ background: 'var(--bg-surface)', display: 'flex', gap: 20, alignItems: 'flex-start', transition: 'transform 0.2s ease', cursor: 'pointer' }}>
                <div style={{ fontSize: '2.5rem', background: 'var(--bg-elevated)', width: 64, height: 64, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {post.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 8 }}>
                    <span className="badge badge-primary" style={{ fontSize: '0.7rem' }}>{post.category}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{post.date} · {post.readTime}</span>
                  </div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 8, color: 'var(--text-primary)' }}>{post.title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.6 }}>{post.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', padding: '40px 0' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 28, height: 28, borderRadius: 6, background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem' }}>⚡</div>
            <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem' }}>GrowthIQ<span style={{ color: 'var(--accent-primary)' }}> AI</span></span>
          </div>
          <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
            {['About','Blog','Privacy','Terms','Contact'].map(l => (
              <Link key={l} href={`/${l.toLowerCase()}`} style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                {l}
              </Link>
            ))}
            <Link href="/pricing" style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', fontWeight: 600 }}>Pricing</Link>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>© 2026 GrowthIQ AI</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

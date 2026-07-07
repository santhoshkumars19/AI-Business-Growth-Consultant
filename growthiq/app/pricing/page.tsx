'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/contexts/ThemeContext';

const PLANS = [
  {
    name: 'Starter',
    price: { monthly: '₹999', annual: '₹799' },
    period: '/mo',
    badge: null,
    color: 'var(--text-secondary)',
    desc: 'Perfect for solo entrepreneurs and early-stage startups.',
    features: [
      'AI Business Analysis (2 / month)',
      'Basic Dashboard & KPI Cards',
      'PDF Report Download',
      '3 Feature Pages',
      'SWOT Analysis',
      'Email Support (48h response)',
    ],
    locked: ['Marketing Plan', 'SEO Audit', 'Competitor Analysis', 'Content Calendar', 'Budget Estimator', 'Admin Panel'],
    cta: 'Get Started',
    primary: false,
  },
  {
    name: 'Growth',
    price: { monthly: '₹2,499', annual: '₹1,999' },
    period: '/mo',
    badge: '⭐ Most Popular',
    color: 'var(--accent-primary)',
    desc: 'Everything you need to scale — built for growing businesses.',
    features: [
      'Unlimited AI Business Analysis',
      'Full Dashboard with Charts',
      'All 9 Feature Pages',
      'SWOT + 30-Day Marketing Plan',
      'SEO Audit & Content Calendar',
      'Budget Estimator & ROI Tracker',
      'Monthly Growth Score & Badges',
      'Priority Support (12h response)',
    ],
    locked: ['White-label Reports', 'Team Accounts', 'API Access', 'Dedicated Manager'],
    cta: 'Start Free Trial',
    primary: true,
  },
  {
    name: 'Scale',
    price: { monthly: '₹5,999', annual: '₹4,799' },
    period: '/mo',
    badge: '🚀 Enterprise',
    color: '#F59E0B',
    desc: 'For established businesses & teams that need full control.',
    features: [
      'Everything in Growth',
      'White-label PDF Reports',
      'Team Accounts (up to 5 users)',
      'API Access & Webhooks',
      'Custom Branding',
      'Dedicated Account Manager',
      'Custom Integrations (Razorpay, Zoho)',
      'SLA-backed Support (4h response)',
    ],
    locked: [],
    cta: 'Contact Sales',
    primary: false,
  },
];

const ADDONS = [
  { id: 'extra-analysis', icon: '🤖', name: 'Extra AI Analysis Pack', desc: '10 additional AI analysis runs per month', price: '₹499/mo', tag: 'Popular' },
  { id: 'competitor-deep', icon: '⚔️', name: 'Competitor Deep Dive', desc: 'Radar chart + detailed competitor breakdown for up to 8 competitors', price: '₹799/mo', tag: null },
  { id: 'seo-pro', icon: '🔎', name: 'SEO Pro Module', desc: 'Full technical SEO audit + backlink analysis + keyword tracking', price: '₹999/mo', tag: 'New' },
  { id: 'whatsapp-reports', icon: '📲', name: 'WhatsApp Weekly Reports', desc: 'Auto-generated weekly summary sent to your WhatsApp every Monday', price: '₹299/mo', tag: null },
  { id: 'multi-branch', icon: '🏪', name: 'Multi-Branch Support', desc: 'Track and compare up to 5 business locations on one dashboard', price: '₹1,499/mo', tag: null },
  { id: 'custom-pdf', icon: '📄', name: 'Custom Branded PDF Reports', desc: 'Add your logo, brand colours, and footer to all PDF exports', price: '₹399/mo', tag: null },
  { id: 'financial-model', icon: '💹', name: 'Financial Modelling Pack', desc: 'Scenario planning, break-even analysis, and 12-month cash flow projections', price: '₹1,299/mo', tag: 'Popular' },
  { id: 'dedicated-manager', icon: '🧑‍💼', name: 'Dedicated Growth Manager', desc: '1-on-1 monthly strategy call with a certified business growth consultant', price: '₹2,999/mo', tag: null },
];

const FAQ = [
  { q: 'Can I cancel anytime?', a: 'Yes. You can cancel your subscription at any time from your account settings. You will continue to have access until the end of your billing period.' },
  { q: 'Is there a free trial?', a: 'All plans include a 14-day free trial. No credit card is required to start. You will only be charged when you choose to continue.' },
  { q: 'What payment methods are accepted?', a: 'We accept UPI, Credit/Debit Cards, Net Banking, and Wallets via Razorpay. All transactions are secured and encrypted.' },
  { q: 'Can I switch plans later?', a: 'Absolutely. You can upgrade or downgrade your plan at any time. Upgrades take effect immediately; downgrades apply from the next billing cycle.' },
  { q: 'Do add-ons carry over between plans?', a: 'Yes. Add-ons work on top of any plan. When you upgrade your base plan, your active add-ons continue without interruption.' },
  { q: 'Is my data safe?', a: 'Your business data is encrypted at rest and in transit. We never share your data with third parties, and you can request deletion at any time.' },
];

export default function PricingPage() {
  const { theme, toggle } = useTheme();
  const [billing, setBilling] = useState<'monthly' | 'annual'>('monthly');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([]);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleAddon = (id: string) =>
    setSelectedAddons(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const addonTotal = selectedAddons.reduce((sum, id) => {
    const a = ADDONS.find(x => x.id === id);
    if (!a) return sum;
    return sum + parseInt(a.price.replace(/[₹,\/mo]/g, ''));
  }, 0);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)' }}>

      {/* Navbar */}
      <nav style={{ position: 'sticky', top: 0, zIndex: 100, background: 'var(--bg-surface)', borderBottom: '1px solid var(--border)', padding: '0 24px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem' }}>⚡</div>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.1rem', color: 'var(--text-primary)' }}>GrowthIQ <span style={{ color: 'var(--accent-primary)' }}>AI</span></span>
        </Link>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <Link href="/" className="btn btn-ghost btn-sm">← Back to Home</Link>
          <Link href="/auth/login" className="btn btn-primary btn-sm">Login</Link>
          <button onClick={toggle} className="btn btn-ghost btn-sm">{theme === 'dark' ? '☀️' : '🌙'}</button>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '72px 24px 48px', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', padding: '4px 16px', background: 'rgba(var(--accent-primary-rgb),0.12)', color: 'var(--accent-primary)', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700, marginBottom: 18 }}>
          💳 PRICING & PLANS
        </div>
        <h1 style={{ fontFamily: 'Outfit', fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 800, marginBottom: 14 }}>
          Simple, transparent pricing
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', maxWidth: 520, margin: '0 auto 32px' }}>
          14-day free trial on all plans. No credit card required. Cancel anytime.
        </p>

        {/* Billing toggle */}
        <div style={{ display: 'inline-flex', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 99, padding: 4, gap: 4, marginBottom: 56 }}>
          <button onClick={() => setBilling('monthly')} style={{ padding: '8px 24px', borderRadius: 99, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', background: billing === 'monthly' ? 'var(--accent-primary)' : 'transparent', color: billing === 'monthly' ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s' }}>
            Monthly
          </button>
          <button onClick={() => setBilling('annual')} style={{ padding: '8px 24px', borderRadius: 99, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: '0.875rem', background: billing === 'annual' ? 'var(--accent-primary)' : 'transparent', color: billing === 'annual' ? '#fff' : 'var(--text-secondary)', transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 8 }}>
            Annual <span style={{ padding: '2px 8px', background: 'rgba(16,185,129,0.2)', color: 'var(--accent-success)', borderRadius: 99, fontSize: '0.7rem', fontWeight: 700 }}>Save 20%</span>
          </button>
        </div>

        {/* Plans Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 24, maxWidth: 1000, margin: '0 auto' }}>
          {PLANS.map((plan, i) => (
            <div key={i} style={{ background: 'var(--bg-surface)', border: plan.primary ? `2px solid var(--accent-primary)` : '1px solid var(--border)', borderRadius: 20, padding: 32, position: 'relative', boxShadow: plan.primary ? 'var(--shadow-glow), var(--shadow-lg)' : 'var(--shadow-sm)', transform: plan.primary ? 'scale(1.03)' : 'none', transition: 'transform 0.2s', textAlign: 'left' }}>
              {plan.badge && (
                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', background: plan.primary ? 'var(--accent-primary)' : plan.color, color: '#fff', fontSize: '0.72rem', fontWeight: 700, padding: '5px 16px', borderRadius: 99, whiteSpace: 'nowrap' }}>
                  {plan.badge}
                </div>
              )}
              <div style={{ color: plan.color, fontWeight: 700, fontSize: '0.9rem', marginBottom: 6 }}>{plan.name}</div>
              <div style={{ fontFamily: 'JetBrains Mono', fontSize: '2.4rem', fontWeight: 800, marginBottom: 2 }}>
                {plan.price[billing]}
                <span style={{ fontFamily: 'Inter', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>{plan.period}</span>
              </div>
              {billing === 'annual' && <div style={{ fontSize: '0.75rem', color: 'var(--accent-success)', marginBottom: 8, fontWeight: 600 }}>🎉 You save 20% with annual billing</div>}
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 20, lineHeight: 1.5 }}>{plan.desc}</p>
              <div style={{ borderTop: '1px solid var(--border)', margin: '0 0 20px' }} />
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {plan.features.map((f, fi) => (
                  <li key={fi} style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <span style={{ color: 'var(--accent-success)', marginTop: 1, flexShrink: 0 }}>✓</span>{f}
                  </li>
                ))}
                {plan.locked.map((f, fi) => (
                  <li key={fi} style={{ fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: 8, opacity: 0.4 }}>
                    <span style={{ flexShrink: 0 }}>🔒</span>{f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register" className={`btn ${plan.primary ? 'btn-primary' : 'btn-ghost'}`} style={{ width: '100%', justifyContent: 'center', display: 'flex' }}>
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Add-ons Section */}
      <section style={{ padding: '72px 24px', background: 'var(--bg-elevated)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div style={{ display: 'inline-block', padding: '4px 16px', background: 'rgba(var(--accent-warning-rgb),0.12)', color: 'var(--accent-warning)', borderRadius: 99, fontSize: '0.78rem', fontWeight: 700, marginBottom: 14 }}>
              ➕ ADD-ONS
            </div>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, marginBottom: 10 }}>Supercharge with Add-ons</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Bolt on exactly what your business needs — no bloat, no lock-in.</p>
          </div>

          {/* Add-on cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, marginBottom: 32 }}>
            {ADDONS.map(addon => {
              const active = selectedAddons.includes(addon.id);
              return (
                <div key={addon.id} onClick={() => toggleAddon(addon.id)} style={{ background: 'var(--bg-surface)', border: `2px solid ${active ? 'var(--accent-primary)' : 'var(--border)'}`, borderRadius: 16, padding: '20px 22px', cursor: 'pointer', transition: 'all 0.2s', boxShadow: active ? 'var(--shadow-glow)' : 'var(--shadow-sm)', position: 'relative', userSelect: 'none' }}>
                  {addon.tag && (
                    <div style={{ position: 'absolute', top: 14, right: 14, padding: '2px 8px', background: addon.tag === 'New' ? 'rgba(var(--accent-success-rgb),0.15)' : 'rgba(var(--accent-primary-rgb),0.12)', color: addon.tag === 'New' ? 'var(--accent-success)' : 'var(--accent-primary)', borderRadius: 99, fontSize: '0.68rem', fontWeight: 700 }}>
                      {addon.tag}
                    </div>
                  )}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                    <div style={{ width: 42, height: 42, borderRadius: 12, background: active ? 'var(--accent-primary)' : 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', flexShrink: 0, transition: 'all 0.2s' }}>
                      {addon.icon}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: '0.9rem', marginBottom: 4 }}>{addon.name}</div>
                      <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 10 }}>{addon.desc}</p>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontFamily: 'JetBrains Mono', fontWeight: 700, fontSize: '0.95rem', color: 'var(--accent-primary)' }}>{addon.price}</span>
                        <div style={{ width: 22, height: 22, borderRadius: '50%', background: active ? 'var(--accent-primary)' : 'var(--bg-elevated)', border: `2px solid ${active ? 'var(--accent-primary)' : 'var(--border)'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', color: '#fff', transition: 'all 0.2s' }}>
                          {active ? '✓' : '+'}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Add-on Summary Bar */}
          {selectedAddons.length > 0 && (
            <div style={{ background: 'var(--bg-surface)', border: '2px solid var(--accent-primary)', borderRadius: 16, padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, boxShadow: 'var(--shadow-glow)' }}>
              <div>
                <div style={{ fontWeight: 700, marginBottom: 4 }}>🛒 Your Selected Add-ons ({selectedAddons.length})</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                  {selectedAddons.map(id => ADDONS.find(a => a.id === id)?.name).join(' · ')}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: 2 }}>Add-on total</div>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent-primary)' }}>+₹{addonTotal.toLocaleString('en-IN')}/mo</div>
              </div>
              <Link href="/auth/register" className="btn btn-primary" style={{ whiteSpace: 'nowrap' }}>
                Continue with Add-ons →
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: '72px 24px', maxWidth: 720, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <h2 style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Frequently Asked Questions</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>Everything you need to know before you start.</p>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {FAQ.map((item, i) => (
            <div key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 14, padding: '18px 22px', cursor: 'pointer', transition: 'border-color 0.2s', borderColor: openFaq === i ? 'var(--accent-primary)' : 'var(--border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 600, fontSize: '0.95rem' }}>
                {item.q}
                <span style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(45deg)' : 'none', fontSize: '1.2rem', flexShrink: 0 }}>+</span>
              </div>
              {openFaq === i && (
                <p style={{ marginTop: 12, fontSize: '0.875rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>{item.a}</p>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: 'var(--bg-surface)', borderTop: '1px solid var(--border)', padding: '28px 24px', textAlign: 'center' }}>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>© 2026 GrowthIQ AI · <Link href="/" style={{ color: 'var(--accent-primary)' }}>Home</Link> · <Link href="/auth/register" style={{ color: 'var(--accent-primary)' }}>Sign Up</Link></p>
      </footer>
    </div>
  );
}

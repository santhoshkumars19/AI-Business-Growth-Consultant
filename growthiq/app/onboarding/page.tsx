'use client';
import { useState, useEffect, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';

const industries = ['Food & Beverage','Retail','Technology','Healthcare','Education','Fashion','Fitness & Wellness','Beauty & Personal Care','Real Estate','Travel & Tourism','Finance & Insurance','Manufacturing','Construction','Agriculture','E-commerce','Consulting','Media & Entertainment','Logistics','Automotive','Others'];

const loadingMessages = [
  'Analysing your revenue patterns...',
  'Comparing industry benchmarks...',
  'Identifying growth opportunities...',
  'Calculating your Business Health Score...',
  'Generating AI recommendations...',
  'Building your personalised dashboard...',
];

function StepIndicator({ step }: { step: number }) {
  return (
    <div className="step-indicator">
      {[1,2,3].map((s, i) => (
        <Fragment key={s}>
          <div className={`step-dot ${step > s ? 'done' : step === s ? 'active' : 'pending'}`}>
            {step > s ? '✓' : s}
          </div>
          {i < 2 && <div className={`step-line ${step > s ? 'done' : ''}`} />}
        </Fragment>
      ))}
    </div>
  );
}

export default function OnboardingPage() {
  const { user, saveBusinessData, fetchWithAuth } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [msgIndex, setMsgIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [form, setForm] = useState({ businessName: '', industry: '', monthlyRevenue: '', monthlyExpenses: '', customers: '', location: '', employees: 5 });
  const [errors, setErrors] = useState<Record<string,string>>({});

  const set = (k: string, v: string | number) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e: Record<string,string> = {};
    if (!form.businessName.trim()) e.businessName = 'Business name is required';
    if (!form.industry) e.industry = 'Please select an industry';
    if (!form.monthlyRevenue || Number(form.monthlyRevenue) <= 0) e.monthlyRevenue = 'Enter a valid revenue amount';
    if (!form.monthlyExpenses || Number(form.monthlyExpenses) <= 0) e.monthlyExpenses = 'Enter a valid expenses amount';
    if (!form.customers || Number(form.customers) <= 0) e.customers = 'Enter number of customers';
    if (!form.location.trim()) e.location = 'Location is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Parse location (e.g. "Chennai, Tamil Nadu")
    const parts = form.location.split(',').map(s => s.trim());
    const city = parts[0] || '';
    const state = parts[1] || 'Tamil Nadu';

    // Calculate margins & values
    const revenue = Number(form.monthlyRevenue);
    const expenses = Number(form.monthlyExpenses);
    const profit_margin = revenue > 0 ? Math.round(((revenue - expenses) / revenue) * 100) : 0;
    const avg_order_value = Number(form.customers) > 0 ? Math.round(revenue / Number(form.customers)) : 0;

    await saveBusinessData({
      business_name: form.businessName,
      industry: form.industry,
      city: city,
      state: state,
      monthly_revenue: revenue,
      monthly_expenses: expenses,
      monthly_customers: Number(form.customers),
      avg_order_value: avg_order_value,
      growth_rate: 0, // default new analysis
      profit_margin: profit_margin,
      online_presence: 'basic', // default
      employee_count: form.employees,
      years_in_business: 1
    });

    setStep(3);
  };

  useEffect(() => {
    if (step !== 3) return;
    
    const msgInterval = setInterval(() => setMsgIndex(i => (i + 1) % loadingMessages.length), 900);
    
    // Gradual progress animation
    let currentProgress = 0;
    const progInterval = setInterval(() => {
      setProgress(p => {
        if (p >= 90) return p; // Hold at 90% until backend is done
        currentProgress = p + 2;
        return currentProgress;
      });
    }, 100);

    // Call real backend API analysis runner
    fetchWithAuth('/analysis/run', { method: 'POST' })
      .then(() => {
        clearInterval(progInterval);
        setProgress(100);
        setTimeout(() => {
          router.push('/analysis');
        }, 500);
      })
      .catch((err) => {
        console.error('AI analysis execution failed:', err);
        alert(`Analysis failed: ${err.message || err}. Please check if database tables exist and Gemini key is valid.`);
        setStep(2);
      });

    return () => {
      clearInterval(msgInterval);
      clearInterval(progInterval);
    };
  }, [step, router]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-base)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
      {/* Step 1 — Theme Selection */}
      {step === 1 && (
        <div style={{ maxWidth: 600, width: '100%', animation: 'fadeSlideUp 0.4s ease' }}>
          <StepIndicator step={1} />
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ fontSize: '2.5rem', marginBottom: 12 }}>✨</div>
            <h1 style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, marginBottom: 10 }}>How do you like it?</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Choose your preferred theme. You can always change this in settings.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
            {(['light','dark'] as const).map(t => (
              <button key={t} onClick={() => setTheme(t)} style={{
                padding: 24, borderRadius: 16, border: `2px solid ${theme === t ? 'var(--accent-primary)' : 'var(--border)'}`,
                background: t === 'light' ? '#F8FAFC' : '#0D1117',
                cursor: 'pointer', transition: 'all 0.2s ease', position: 'relative', overflow: 'hidden',
                boxShadow: theme === t ? 'var(--shadow-glow)' : 'none'
              }}>
                {theme === t && <div style={{ position: 'absolute', top: 10, right: 10, width: 22, height: 22, borderRadius: '50%', background: 'var(--accent-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '0.7rem', fontWeight: 700 }}>✓</div>}
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>{t === 'light' ? '☀️' : '🌙'}</div>
                {/* Mini dashboard preview */}
                <div style={{ background: t === 'light' ? '#fff' : '#161B22', borderRadius: 10, padding: 10, border: `1px solid ${t === 'light' ? '#E2E8F0' : '#30363D'}` }}>
                  <div style={{ height: 8, borderRadius: 4, background: t === 'light' ? '#6366F1' : '#818CF8', marginBottom: 6, width: '70%' }} />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 4 }}>
                    {[1,2,3,4].map(i => <div key={i} style={{ height: 20, borderRadius: 4, background: t === 'light' ? '#F1F5F9' : '#1C2128' }} />)}
                  </div>
                </div>
                <div style={{ marginTop: 12, fontWeight: 700, fontSize: '0.95rem', color: t === 'light' ? '#0F172A' : '#E6EDF3', textTransform: 'capitalize' }}>{t} Mode</div>
              </button>
            ))}
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} onClick={() => setStep(2)}>Continue →</button>
        </div>
      )}

      {/* Step 2 — Business Data Form */}
      {step === 2 && (
        <div style={{ maxWidth: 640, width: '100%', animation: 'fadeSlideUp 0.4s ease' }}>
          <StepIndicator step={2} />
          <div style={{ marginBottom: 32 }}>
            <h1 style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, marginBottom: 8 }}>Tell us about your business</h1>
            <p style={{ color: 'var(--text-secondary)' }}>This takes 2 minutes. Your data stays private and secure. We use it only to generate your personalised AI analysis.</p>
          </div>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="input-group">
                <label className="input-label">Business Name *</label>
                <input className={`input ${errors.businessName ? 'input-error' : ''}`} type="text" placeholder="e.g. Bloom Bakery" value={form.businessName} onChange={e => set('businessName', e.target.value)} />
                {errors.businessName && <div className="error-msg">{errors.businessName}</div>}
              </div>
              <div className="input-group">
                <label className="input-label">Industry *</label>
                <select className={`input ${errors.industry ? 'input-error' : ''}`} value={form.industry} onChange={e => set('industry', e.target.value)}>
                  <option value="">Select your industry</option>
                  {industries.map(i => <option key={i} value={i}>{i}</option>)}
                </select>
                {errors.industry && <div className="error-msg">{errors.industry}</div>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="input-group">
                <label className="input-label">Monthly Revenue (₹) *</label>
                <input className={`input ${errors.monthlyRevenue ? 'input-error' : ''}`} type="number" placeholder="e.g. 250000" value={form.monthlyRevenue} onChange={e => set('monthlyRevenue', e.target.value)} min="0" />
                <div className="input-helper">Enter amount in Indian Rupees</div>
                {errors.monthlyRevenue && <div className="error-msg">{errors.monthlyRevenue}</div>}
              </div>
              <div className="input-group">
                <label className="input-label">Monthly Expenses (₹) *</label>
                <input className={`input ${errors.monthlyExpenses ? 'input-error' : ''}`} type="number" placeholder="e.g. 180000" value={form.monthlyExpenses} onChange={e => set('monthlyExpenses', e.target.value)} min="0" />
                <div className="input-helper">Include all operating costs</div>
                {errors.monthlyExpenses && <div className="error-msg">{errors.monthlyExpenses}</div>}
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
              <div className="input-group">
                <label className="input-label">Active Customers *</label>
                <input className={`input ${errors.customers ? 'input-error' : ''}`} type="number" placeholder="e.g. 165" value={form.customers} onChange={e => set('customers', e.target.value)} min="0" />
                <div className="input-helper">Customers per month</div>
                {errors.customers && <div className="error-msg">{errors.customers}</div>}
              </div>
              <div className="input-group">
                <label className="input-label">Location *</label>
                <input className={`input ${errors.location ? 'input-error' : ''}`} type="text" placeholder="e.g. Mumbai, Maharashtra" value={form.location} onChange={e => set('location', e.target.value)} />
                {errors.location && <div className="error-msg">{errors.location}</div>}
              </div>
            </div>
            <div className="input-group">
              <label className="input-label">Number of Employees: <strong style={{ color: 'var(--accent-primary)' }}>{form.employees}</strong></label>
              <input type="range" min="1" max="200" value={form.employees} onChange={e => set('employees', Number(e.target.value))} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                {['1','10','25','50','100','200+'].map(l => <span key={l} style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{l}</span>)}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 8 }}>
              <button type="button" className="btn btn-ghost btn-lg" onClick={() => setStep(1)} style={{ flex: 1 }}>← Back</button>
              <button type="submit" className="btn btn-primary btn-lg" style={{ flex: 2 }}>Analyse My Business 🚀</button>
            </div>
            <p style={{ textAlign: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>🔒 Encrypted & Private. We never share your data.</p>
          </form>
        </div>
      )}

      {/* Step 3 — AI Processing */}
      {step === 3 && (
        <div style={{ maxWidth: 520, width: '100%', textAlign: 'center', animation: 'fadeSlideUp 0.4s ease' }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--gradient-hero)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2.5rem', margin: '0 auto 20px', animation: 'pulse-ring 2s ease-in-out infinite' }}>🧠</div>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '1.75rem', fontWeight: 800, marginBottom: 10 }}>Analysing your business</h2>
            <p style={{ color: 'var(--text-secondary)' }}>Our AI is crunching the numbers...</p>
          </div>
          <div style={{ background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 16, padding: '28px 32px', marginBottom: 28 }}>
            <div style={{ minHeight: 28, fontSize: '0.95rem', color: 'var(--accent-primary)', fontWeight: 500, marginBottom: 20, transition: 'all 0.3s ease' }}>
              ✨ {loadingMessages[msgIndex]}
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
            <div style={{ marginTop: 10, fontSize: '0.78rem', color: 'var(--text-muted)', textAlign: 'right' }}>{progress}%</div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {['Benchmarking against 2,400+ businesses','Identifying revenue growth opportunities','Calculating your Health Score','Preparing AI recommendations'].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: progress > i * 25 ? 'rgba(var(--accent-success-rgb),0.08)' : 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 10, transition: 'all 0.3s ease' }}>
                <span style={{ fontSize: '1rem' }}>{progress > i * 25 ? '✅' : '⏳'}</span>
                <span style={{ fontSize: '0.85rem', color: progress > i * 25 ? 'var(--accent-success)' : 'var(--text-secondary)' }}>{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

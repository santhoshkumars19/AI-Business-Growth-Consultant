'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

const months = ['Jan','Feb','Mar','Apr','May','Jun'];
const mrr = [89000,124000,168000,215000,268000,312000];

const opts = { responsive:true, maintainAspectRatio:false, plugins:{legend:{display:false}}, scales:{ x:{grid:{display:false},ticks:{color:'var(--text-muted)',font:{size:11}}}, y:{grid:{color:'rgba(255,255,255,0.04)'},ticks:{color:'var(--text-muted)',font:{size:11}, callback:(v:number|string)=>`₹${(Number(v)/1000).toFixed(0)}K`},border:{display:false}} } };

interface PaymentItem {
  id: string;
  user_id: string;
  razorpay_order_id: string;
  razorpay_payment_id?: string;
  amount: number;
  plan: string;
  status: string;
  created_at: string;
  // Resolved custom properties
  user_name?: string;
}

export default function AdminRevenuePage() {
  const { fetchWithAuth, user } = useAuth();
  const [payments, setPayments] = useState<PaymentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRevenue = async () => {
      if (!user || user.role !== 'admin') {
        setLoading(false);
        return;
      }
      try {
        const data = await fetchWithAuth('/admin/revenue');
        if (Array.isArray(data)) {
          setPayments(data);
        }
      } catch (err) {
        console.error('Failed to load admin revenue payments:', err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      loadRevenue();
    }
  }, [user]);

  // Compute stats
  const totalSuccess = payments.filter(p => p.status === 'success');
  const computedMRR = totalSuccess.reduce((acc, curr) => acc + (curr.amount / 100), 0);

  return (
    <div>
      <div style={{ marginBottom:24 }}>
        <h1 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:4 }}>Revenue Reports</h1>
        <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem' }}>Subscription revenue, MRR, and Razorpay transaction data</p>
      </div>

      <div className="grid-4" style={{ marginBottom:24 }}>
        {[
          ['💰','Computed MRR', `₹${computedMRR.toLocaleString('en-IN')}`, 'Successful payments', 'success'],
          ['📅','ARR', `₹${(computedMRR * 12).toLocaleString('en-IN')}`, 'Annualised projection', 'primary'],
          ['📉','Churn Rate', '1.1%', '-0.3% vs last month', 'warning'],
          ['💎','Total Orders', payments.length, 'Orders generated', 'danger']
        ].map(([icon,label,val,sub,color])=>(
          <div key={String(label)} className="admin-stat">
            <span style={{ fontSize:'1.5rem' }}>{icon}</span>
            <div className="admin-kpi" style={{ color:`var(--accent-${color})`, marginTop:6, fontSize:'1.5rem' }}>{val}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', marginTop:2 }}>{label}</div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-secondary)', marginTop:4 }}>{sub}</div>
          </div>
        ))}
      </div>

      <div className="card p-6" style={{ marginBottom:20 }}>
        <h3 style={{ fontWeight:700, marginBottom:14 }}>📈 MRR Growth</h3>
        <div style={{ height:180 }}>
          <Line data={{ labels:months, datasets:[{ label:'MRR', data:mrr, borderColor:'#10B981', backgroundColor:'rgba(16,185,129,0.1)', fill:true, tension:0.4, pointRadius:5, pointBackgroundColor:'#10B981', pointBorderColor:'#fff', pointBorderWidth:2 }] }} options={opts as Parameters<typeof Line>[0]['options']} />
        </div>
      </div>

      <div className="card" style={{ marginBottom:20, overflow:'hidden' }}>
        <div style={{ padding:'16px 24px', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between' }}>
          <h3 style={{ fontWeight:700 }}>💳 Razorpay Transactions</h3>
          <button className="btn btn-ghost btn-sm">📥 Export CSV</button>
        </div>
        <div className="table-wrapper" style={{ border:'none', borderRadius:0 }}>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Order ID</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Payment ID</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((t, i) => (
                <tr key={i}>
                  <td style={{ fontSize:'0.82rem', color:'var(--text-muted)' }}>
                    {t.created_at ? new Date(t.created_at).toLocaleDateString('en-IN') : 'N/A'}
                  </td>
                  <td style={{ fontSize:'0.875rem' }}>{t.razorpay_order_id}</td>
                  <td><span className="badge badge-muted" style={{ textTransform: 'capitalize' }}>{t.plan}</span></td>
                  <td style={{ fontFamily:'JetBrains Mono', fontWeight:600 }}>₹{(t.amount / 100).toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`badge badge-${t.status === 'success' ? 'success' : t.status === 'failed' ? 'danger' : 'warning'}`} style={{ textTransform:'capitalize' }}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontFamily:'JetBrains Mono' }}>
                    {t.razorpay_payment_id || 'Pending'}
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>
                    No transactions recorded in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

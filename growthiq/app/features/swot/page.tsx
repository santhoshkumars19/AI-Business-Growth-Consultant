'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface SwotData {
  strengths: string[];
  weaknesses: string[];
  opportunities: string[];
  threats: string[];
}

export default function SwotPage() {
  const { fetchWithAuth, user } = useAuth();
  const [items, setItems] = useState<SwotData>({ strengths: [], weaknesses: [], opportunities: [], threats: [] });
  const [loading, setLoading] = useState(true);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [newItem, setNewItem] = useState('');

  useEffect(() => {
    const loadSwot = async () => {
      try {
        const data = await fetchWithAuth('/features/swot');
        if (data.swot) {
          setItems(data.swot);
        }
      } catch (e) {
        console.error('Failed to load SWOT:', e);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      loadSwot();
    }
  }, [user]);

  const addItem = (key: keyof SwotData) => {
    if (!newItem.trim()) return;
    setItems(prev => ({ ...prev, [key]: [...(prev[key] || []), newItem.trim()] }));
    setNewItem(''); setEditingCell(null);
  };

  const removeItem = (key: keyof SwotData, index: number) => {
    setItems(prev => ({ ...prev, [key]: (prev[key] || []).filter((_, i) => i !== index) }));
  };

  const cells: { key: keyof SwotData; label: string; icon: string; className: string; headerColor: string }[] = [
    { key:'strengths', label:'Strengths', icon:'💪', className:'swot-strengths', headerColor:'var(--accent-success)' },
    { key:'weaknesses', label:'Weaknesses', icon:'⚠️', className:'swot-weaknesses', headerColor:'var(--accent-warning)' },
    { key:'opportunities', label:'Opportunities', icon:'🚀', className:'swot-opportunities', headerColor:'var(--accent-primary)' },
    { key:'threats', label:'Threats', icon:'🔴', className:'swot-threats', headerColor:'var(--accent-danger)' },
  ];

  if (loading) {
    return (
      <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 16 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', border: '3px solid var(--border)', borderTopColor: 'var(--accent-primary)', animation: 'spin 1s linear infinite' }} />
        <p style={{ color: 'var(--text-secondary)' }}>Loading SWOT Analysis...</p>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
        <div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800, marginBottom:4 }}>SWOT Analysis</h1>
          <p style={{ color:'var(--text-secondary)', fontSize:'0.875rem' }}>AI-generated strengths, weaknesses, opportunities & threats — editable</p>
        </div>
      </div>

      <div className="swot-grid">
        {cells.map(cell => (
          <div key={cell.key} className={`swot-cell ${cell.className}`}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:16 }}>
              <span style={{ fontSize:'1.4rem' }}>{cell.icon}</span>
              <h2 style={{ fontSize:'1rem', fontWeight:700, color:cell.headerColor }}>{cell.label}</h2>
              <span style={{ marginLeft:'auto', background:'var(--bg-surface)', color:'var(--text-muted)', fontSize:'0.72rem', fontWeight:600, padding:'2px 8px', borderRadius:99 }}>{(items[cell.key] || []).length}</span>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {(items[cell.key] || []).map((item, i) => (
                <div key={i} style={{ display:'flex', alignItems:'flex-start', gap:8, padding:'8px 12px', background:'var(--bg-surface)', borderRadius:8, border:'1px solid var(--border)' }}>
                  <span style={{ color:cell.headerColor, marginTop:1, flexShrink:0 }}>•</span>
                  <span style={{ fontSize:'0.85rem', lineHeight:1.5, flex:1 }}>{item}</span>
                  <button onClick={() => removeItem(cell.key, i)} style={{ color:'var(--text-muted)', background:'none', border:'none', cursor:'pointer', fontSize:'1rem', flexShrink:0, lineHeight:1 }}>×</button>
                </div>
              ))}
              {editingCell === cell.key ? (
                <div style={{ display:'flex', gap:6 }}>
                  <input autoFocus value={newItem} onChange={e => setNewItem(e.target.value)} onKeyDown={e => { if(e.key==='Enter') addItem(cell.key); if(e.key==='Escape') { setEditingCell(null); setNewItem(''); } }} placeholder="Type and press Enter..." className="input" style={{ fontSize:'0.82rem', padding:'8px 10px' }} />
                  <button onClick={() => addItem(cell.key)} className="btn btn-primary btn-sm">Add</button>
                </div>
              ) : (
                <button onClick={() => { setEditingCell(cell.key); setNewItem(''); }} style={{ display:'flex', alignItems:'center', gap:6, padding:'8px 12px', border:'1px dashed var(--border)', borderRadius:8, background:'transparent', color:'var(--text-muted)', fontSize:'0.82rem', cursor:'pointer', width:'100%' }}>
                  ＋ Add item
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

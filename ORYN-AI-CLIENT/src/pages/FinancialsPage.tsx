import React, { useState, useEffect } from 'react';
import type { FinancialEntry } from '../types';
import CustomDatePicker from '../components/CustomDatePicker';
import { fetchFinancials, postFinancialEntry } from '../api/oryn';

export default function FinancialsPage() {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [metrics, setMetrics] = useState<{ totalRevenue: number; totalExpenses: number; netProfit: number; margin: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [newEntry, setNewEntry] = useState<Partial<FinancialEntry>>({
    type: 'revenue',
    category: '',
    amount: 0,
    date: new Date().toISOString().split('T')[0]
  });

  const loadData = async () => {
    try {
      const data = await fetchFinancials();
      setEntries(data.entries || []);
      setMetrics(data.metrics || null);
    } catch (err: any) {
      console.error(err);
      setErrorMsg('Failed to load financial ledger from server.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddEntry = async () => {
    if (!newEntry.category || !newEntry.amount) return;
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await postFinancialEntry({
        type: (newEntry.type as 'revenue' | 'expense') || 'revenue',
        category: newEntry.category,
        amount: Number(newEntry.amount),
        date: newEntry.date || new Date().toISOString().split('T')[0],
        note: 'Manual fiscal ledger entry'
      });

      setEntries(prev => [res.entry, ...prev]);
      setMetrics(res.metrics);
      setNewEntry({
        type: 'revenue',
        category: '',
        amount: 0,
        date: new Date().toISOString().split('T')[0]
      });
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to post transaction.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const revenue = metrics?.totalRevenue ?? 0;
  const netProfit = metrics?.netProfit ?? 0;
  const margin = metrics?.margin ?? 0;

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 40, display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Fiscal Intelligence</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: 1.5 }}>
            <span style={{ color: 'var(--success)' }}>Financials</span> · Performance Ledger
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, background: 'rgba(6,17,36,0.6)', padding: '10px 20px', borderRadius: 12, border: '1px solid var(--border)' }}>
          <StatMini label="Gross Revenue" value={`$${(revenue / 1000).toFixed(1)}K`} color="var(--cyan)" />
          <div style={{ width: 1, height: 30, background: 'var(--glass-bg-strong)' }} />
          <StatMini label="Net Profit" value={`$${(netProfit / 1000).toFixed(1)}K`} color="var(--success)" />
          <div style={{ width: 1, height: 30, background: 'var(--glass-bg-strong)' }} />
          <StatMini label="Profit Margin" value={`${margin.toFixed(1)}%`} color="var(--violet)" />
        </div>
      </div>

      {errorMsg && (
        <div style={{
          padding: '12px 18px', borderRadius: 10,
          background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)',
          color: 'var(--danger)', fontSize: 13
        }}>
          {errorMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: 24 }}>
        {/* Entry Form */}
        <div style={{ 
          background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, 
          backdropFilter: 'blur(20px)', position: 'relative', zIndex: 10 
        }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: 24 }}><span className="color-circle"></span>Record New Transaction</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <FormLabel>Transaction Type</FormLabel>
              <div style={{ display: 'flex', gap: 10 }}>
                {['revenue', 'expense'].map(t => (
                  <button key={t} 
                    onClick={() => setNewEntry({ ...newEntry, type: t as any })}
                    style={{ 
                      flex: 1, padding: '12px', borderRadius: 10, fontSize: 11, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', fontFamily: 'var(--font-display)',
                      background: newEntry.type === t ? (t === 'revenue' ? 'rgba(0,255,170,0.15)' : 'rgba(255,51,102,0.15)') : 'var(--glass-bg-subtle)',
                      color: newEntry.type === t ? (t === 'revenue' ? 'var(--success)' : 'var(--danger)') : 'var(--muted)',
                      border: `1px solid ${newEntry.type === t ? (t === 'revenue' ? 'var(--success)' : 'var(--danger)') : 'var(--glass-bg-strong)'}`,
                      cursor: 'pointer', transition: 'all 0.2s'
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <FormLabel>Category</FormLabel>
              <Input placeholder="e.g. SaaS, Infrastructure, Consulting" value={newEntry.category} onChange={e => setNewEntry({ ...newEntry, category: e.target.value })} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <FormLabel>Amount ($)</FormLabel>
                <Input type="number" placeholder="0.00" value={newEntry.amount || ''} onChange={e => setNewEntry({ ...newEntry, amount: Number(e.target.value) })} />
              </div>
              <div>
                <FormLabel>Date</FormLabel>
                <CustomDatePicker value={newEntry.date || ''} onChange={val => setNewEntry({ ...newEntry, date: val })} />
              </div>
            </div>
            <button 
              onClick={handleAddEntry}
              disabled={isSubmitting || !newEntry.category || !newEntry.amount}
              style={{ 
                marginTop: 10, padding: '16px', borderRadius: 12, background: 'var(--success)', color: 'var(--bg)', 
                fontFamily: 'var(--font-display)', fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase',
                cursor: isSubmitting ? 'wait' : 'pointer', boxShadow: '0 0 20px rgba(0,255,170,0.4)', border: 'none',
                opacity: (!newEntry.category || !newEntry.amount) ? 0.6 : 1
              }}
            >
              {isSubmitting ? 'POSTING TO LEDGER...' : 'POST TRANSACTION'}
            </button>
          </div>
        </div>

        {/* Ledger */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, backdropFilter: 'blur(20px)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: 'var(--violet)', textTransform: 'uppercase', marginBottom: 24 }}><span className="color-circle"></span>Transaction History ({entries.length})</div>
          
          {loading ? (
            <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 30 }}>
              Querying persistent financial ledger...
            </div>
          ) : entries.length === 0 ? (
            <div style={{ color: 'var(--muted)', fontSize: 13, textAlign: 'center', padding: 30 }}>
              No transactions recorded in ledger. Use the form on the left to record your first transaction.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {entries.map(e => (
                <div key={e.id} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '16px 20px', background: 'var(--glass-bg-subtle)', border: '1px solid var(--glass-bg-hover)', borderRadius: 12 }}>
                  <div style={{ 
                    width: 44, height: 44, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                    background: e.type === 'revenue' ? 'rgba(0,255,170,0.1)' : 'rgba(255,51,102,0.1)',
                    color: e.type === 'revenue' ? 'var(--success)' : 'var(--danger)'
                  }}>
                    {e.type === 'revenue' ? '↙' : '↗'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'white' }}>{e.category}</div>
                    <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>{e.note}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ 
                      fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, 
                      color: e.type === 'revenue' ? 'var(--success)' : 'var(--danger)',
                      textShadow: `0 0 10px ${e.type === 'revenue' ? 'rgba(0,255,170,0.3)' : 'rgba(255,51,102,0.3)'}`
                    }}>
                      {e.type === 'revenue' ? '+' : '-'}${e.amount.toLocaleString()}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--muted)', marginTop: 2 }}>{e.date}</div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatMini({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 9, fontWeight: 700, color: 'var(--muted)', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 800, color: color, textShadow: `0 0 10px ${color}60` }}>{value}</div>
    </div>
  );
}

function FormLabel({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, color: 'var(--muted)', letterSpacing: 2, marginBottom: 8, textTransform: 'uppercase' }}>{children}</div>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input 
      {...props} 
      style={{ 
        width: '100%', padding: '14px 18px', background: 'var(--glass-bg-hover)', border: '1px solid var(--glass-bg-strong)', borderRadius: 12,
        color: 'white', fontFamily: 'inherit', fontSize: 14, outline: 'none', transition: 'all 0.2s', ...props.style 
      }} 
      onFocus={e => { e.currentTarget.style.borderColor = 'rgba(0,240,255,0.4)'; e.currentTarget.style.boxShadow = '0 0 12px rgba(0,240,255,0.1) inset'; }}
      onBlur={e => { e.currentTarget.style.borderColor = 'var(--glass-bg-strong)'; e.currentTarget.style.boxShadow = 'none'; }}
    />
  );
}

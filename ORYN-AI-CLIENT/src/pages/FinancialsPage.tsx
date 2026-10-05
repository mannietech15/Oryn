import { useState, useEffect } from 'react';
import type { FinancialEntry } from '../types';
import { fetchFinancials, postFinancialEntry } from '../api/oryn';
import { 
  FinCard, 
  FiscalInsightSummary, 
  FiscalKpis, 
  buildFiscalKpis, 
  FiscalChart, 
  LedgerEntryForm, 
  LedgerTransactionList, 
  CategoryBreakdown 
} from '../components/FinancialComponents';

export default function FinancialsPage() {
  const [entries, setEntries] = useState<FinancialEntry[]>([]);
  const [metrics, setMetrics] = useState<{ totalRevenue: number; totalExpenses: number; netProfit: number; margin: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);


  useEffect(() => {
    let isSubscribed = true;

    const fetchLedger = () => {
      fetchFinancials()
        .then(data => {
          if (isSubscribed) {
            setEntries(data.entries || []);
            setMetrics(data.metrics || null);
          }
        })
        .catch(err => {
          if (isSubscribed) console.error(err);
        })
        .finally(() => {
          if (isSubscribed) setLoading(false);
        });
    };

    fetchLedger();
    const interval = setInterval(fetchLedger, 4000);

    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, []);

  const handleAddEntry = async (entry: { type: 'revenue' | 'expense'; category: string; amount: number; date: string; note?: string }) => {
    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const res = await postFinancialEntry({
        type: entry.type,
        category: entry.category,
        amount: entry.amount,
        date: entry.date,
        note: entry.note || 'Manual fiscal ledger entry'
      });

      setEntries(prev => [res.entry, ...prev]);
      setMetrics(res.metrics);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to post transaction to persistent ledger.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  const revenue = metrics?.totalRevenue ?? 0;
  const expenses = metrics?.totalExpenses ?? 0;
  const netProfit = metrics?.netProfit ?? 0;
  const margin = metrics?.margin ?? 0;

  const kpiItems = buildFiscalKpis(metrics, entries.length);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '36px 40px', background: 'var(--bg)', position: 'relative' }}>
      <div className="page-fullwidth-container" style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 28 }}>

        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -0.5 }}>
              Financial Overview & Ledger Reconciliation
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              System financial transactions, operating margin, and cash flow balance.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10 }}>
            <div style={{
              padding: '6px 14px', borderRadius: 8,
              background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)',
              fontSize: 12, fontFamily: 'monospace', color: 'var(--text-muted)'
            }}>
              POSTED RECORDS: <strong style={{ color: 'var(--text-primary)' }}>{entries.length}</strong>
            </div>
          </div>
        </div>

        {/* Evidence-oriented Operational Fiscal Finding */}
        <FiscalInsightSummary 
          revenue={revenue} 
          expenses={expenses} 
          netProfit={netProfit} 
          margin={margin} 
          entryCount={entries.length} 
        />

        {/* Top 4 Contextual KPIs */}
        <FiscalKpis items={kpiItems} loading={loading} />

        {/* Cash Flow Trajectory Chart */}
        <FinCard 
          title="Cash Flow Trajectory & Fiscal Velocity" 
          subtitle="Real-time revenue versus disbursement timeline plotted from persistent ledger"
        >
          <FiscalChart entries={entries} />
        </FinCard>

        {/* 2-Column Section: Entry Form & Transaction Registry */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(360px, 1fr) minmax(500px, 1.6fr)', gap: 24, alignItems: 'start' }}>
          {/* Left Column: Entry Form */}
          <FinCard 
            title="Record Ledger Transaction" 
            subtitle="Post a double-entry debit or credit to the persistent ledger"
          >
            <LedgerEntryForm 
              onSubmit={handleAddEntry} 
              isSubmitting={isSubmitting} 
              error={errorMsg} 
            />
          </FinCard>

          {/* Right Column: Transaction Registry */}
          <FinCard 
            title="Transaction Audit Registry" 
            subtitle={`Querying ${entries.length} verified posted transactions`}
          >
            <LedgerTransactionList 
              entries={entries} 
              loading={loading} 
            />
          </FinCard>
        </div>

        {/* Bottom Section: Category Allocation Breakdown */}
        <FinCard 
          title="Capital Allocation by Category" 
          subtitle="Relative distribution of inflows and disbursements across enterprise operations"
        >
          <CategoryBreakdown entries={entries} />
        </FinCard>

      </div>
    </div>
  );
}

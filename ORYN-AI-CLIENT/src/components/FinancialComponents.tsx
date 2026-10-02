import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export interface FinCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  colSpan?: number;
  style?: React.CSSProperties;
  delay?: number;
}

export function FinCard({ title, subtitle, children, colSpan, style, delay = 0 }: FinCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.23, 1, 0.32, 1] }}
      style={{ 
        background: 'var(--card-bg)', 
        border: '1px solid var(--card-border)', 
        borderRadius: 20, 
        padding: '28px', 
        boxShadow: 'var(--shadow-subtle)', 
        gridColumn: colSpan ? `span ${colSpan}` : undefined,
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
    >
      <div style={{ marginBottom: 20 }}>
        <div style={{ 
          fontFamily: 'var(--font-display)', 
          fontSize: 12, 
          fontWeight: 700, 
          letterSpacing: 1.5, 
          color: 'var(--text-secondary)', 
          textTransform: 'uppercase', 
          display: 'flex', 
          alignItems: 'center', 
          gap: 10 
        }}>
          <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)' }} />
          {title}
        </div>
        {subtitle && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
            {subtitle}
          </div>
        )}
      </div>
      {children}
    </motion.div>
  );
}

export function FiscalInsightSummary({ 
  revenue, 
  expenses, 
  netProfit, 
  margin, 
  entryCount 
}: { 
  revenue: number; 
  expenses: number; 
  netProfit: number; 
  margin: number; 
  entryCount: number; 
}) {
  const isProfitable = netProfit >= 0;

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      style={{ 
        position: 'relative',
        background: 'var(--card-bg)',
        border: '1px solid var(--card-border)',
        borderRadius: 16,
        padding: '24px 28px',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        boxShadow: 'var(--shadow-subtle)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, borderBottom: '1px solid var(--card-border)', paddingBottom: 12 }}>
        <div style={{ fontFamily: 'monospace', fontSize: 11, fontWeight: 700, color: 'var(--accent-primary)', letterSpacing: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-primary)' }} />
          FISCAL AUDIT · DOUBLE-ENTRY LEDGER RECONCILIATION
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          DATASET: PERSISTENT_LEDGER_STORAGE
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Step 1: Observation */}
        <div style={{ background: 'var(--glass-bg-subtle)', padding: '14px 16px', borderRadius: 10, border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>
            1. OBSERVATION
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
            Ledger gross volume is verified at <strong style={{ color: 'var(--success)' }}>${revenue.toLocaleString()}</strong> against <strong style={{ color: 'var(--danger)' }}>${expenses.toLocaleString()}</strong> in operational disbursements.
          </div>
        </div>

        {/* Step 2: Evidence */}
        <div style={{ background: 'var(--glass-bg-subtle)', padding: '14px 16px', borderRadius: 10, border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>
            2. EVIDENCE
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
            Operating margin is currently at <strong style={{ color: isProfitable ? 'var(--success)' : 'var(--danger)' }}>{margin.toFixed(1)}%</strong> across {entryCount} verified posted ledger transactions.
          </div>
        </div>

        {/* Step 3: Recommended Action */}
        <div style={{ background: 'rgba(249, 115, 22, 0.04)', padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(249, 115, 22, 0.2)' }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--accent-primary)', fontWeight: 700, marginBottom: 4 }}>
            3. RECOMMENDED ACTION
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
            {isProfitable 
              ? 'Capital reserves are self-sustaining. Allocate surplus velocity toward autonomous workflow scaling.'
              : 'Disbursements exceed recognized collections. Audit variable infrastructure expenditures.'}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export interface FiscalKpiData {
  label: string;
  value: string;
  detail: string;
  source: string;
  period: string;
  accent: string;
  icon: React.ReactNode;
}

export function FiscalKpis({ items, loading }: { items: FiscalKpiData[]; loading?: boolean }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
      {items.map((k, i) => (
        <div 
          key={i} 
          style={{
            background: 'var(--card-bg)', 
            border: '1px solid var(--card-border)',
            borderRadius: 14, 
            padding: '20px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 8,
            boxShadow: 'var(--shadow-subtle)',
            transition: 'transform 0.2s ease, border-color 0.2s ease'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
              {k.label}
            </span>
            <span style={{ color: k.accent }}>{k.icon}</span>
          </div>
          <div style={{ fontSize: 26, fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--text-primary)' }}>
            {loading ? '...' : k.value}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
            {k.detail}
          </div>
          <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: 8, marginTop: 4, display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)' }}>
            <span>{k.source}</span>
            <span>{k.period}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

export function buildFiscalKpis(
  metrics: { totalRevenue: number; totalExpenses: number; netProfit: number; margin: number } | null,
  entryCount: number
): FiscalKpiData[] {
  const rev = metrics?.totalRevenue ?? 0;
  return [
    {
      label: 'Gross Ledger Revenue',
      value: `$${(rev / 1000).toFixed(1)}K`,
      detail: `${entryCount} total transactions posted to ledger`,
      source: 'JSON Storage Engine',
      period: 'Verified historical total',
      accent: 'var(--accent-primary)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
          <polyline points="17 6 23 6 23 12"></polyline>
        </svg>
      )
    },
    {
      label: 'Operational Disbursements',
      value: `$${((metrics?.totalExpenses ?? 0) / 1000).toFixed(1)}K`,
      detail: 'Accumulated operational liabilities',
      source: 'Accounts Payable Ledger',
      period: 'Verified historical total',
      accent: 'var(--danger)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline>
          <polyline points="17 18 23 18 23 12"></polyline>
        </svg>
      )
    },
    {
      label: 'Net Capital Velocity',
      value: `${(metrics?.netProfit ?? 0) < 0 ? '-' : ''}$${Math.abs((metrics?.netProfit ?? 0) / 1000).toFixed(1)}K`,
      detail: (metrics?.netProfit ?? 0) >= 0 ? 'Net positive retained cash velocity' : 'Operating deficit / negative run-rate',
      source: 'Capital Treasury Ledger',
      period: 'Verified net delta',
      accent: (metrics?.netProfit ?? 0) >= 0 ? 'var(--success)' : 'var(--danger)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
          <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
        </svg>
      )
    },
    {
      label: 'Operating Fiscal Margin',
      value: `${(metrics?.margin ?? 0).toFixed(1)}%`,
      detail: (metrics?.margin ?? 0) >= 20 
        ? 'Healthy solvency margin (>20% benchmark)' 
        : (metrics?.margin ?? 0) >= 0 
          ? 'Positive operating threshold' 
          : 'Sub-zero fiscal contraction bound',
      source: 'Ledger Audit Calculations',
      period: 'Fiscal cycle ratio',
      accent: (metrics?.margin ?? 0) >= 20 ? 'var(--success)' : (metrics?.margin ?? 0) >= 0 ? 'var(--accent-primary)' : 'var(--danger)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="m4.93 4.93 4.24 4.24"></path>
          <path d="m14.83 9.17 4.24-4.24"></path>
          <path d="m14.83 14.83 4.24 4.24"></path>
          <path d="m9.17 14.83-4.24 4.24"></path>
          <circle cx="12" cy="12" r="4"></circle>
        </svg>
      )
    }
  ];
}

export interface FiscalChartProps {
  entries: { id?: string; date: string; amount: number; type: 'revenue' | 'expense' }[];
}

export function FiscalChart({ entries }: FiscalChartProps) {
  const chartData = [...entries]
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .map(e => ({
      date: e.date,
      revenue: e.type === 'revenue' ? e.amount : 0,
      expense: e.type === 'expense' ? e.amount : 0
    }));

  if (chartData.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
        No financial telemetry recorded. Post transactions to generate cash flow curves.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', height: 280, marginTop: 10 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}








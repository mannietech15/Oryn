import React from 'react';
import { motion } from 'framer-motion';

export interface OrgCardProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  colSpan?: number;
  style?: React.CSSProperties;
  delay?: number;
}

export function OrgCard({ title, subtitle, children, colSpan, style, delay = 0 }: OrgCardProps) {
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

export function GovernanceInsightSummary({
  totalEmployees,
  activeCount,
  remoteCount,
  departmentsCount,
  companyName
}: {
  totalEmployees: number;
  activeCount: number;
  remoteCount: number;
  departmentsCount: number;
  companyName: string;
}) {
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
          WORKFORCE GOVERNANCE · MULTI-TENANT ENTITY MATRIX
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
          WORKSPACE: {companyName.toUpperCase().replace(/\s+/g, '_')}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Step 1: Observation */}
        <div style={{ background: 'var(--glass-bg-subtle)', padding: '14px 16px', borderRadius: 10, border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>
            1. WORKFORCE DISTRIBUTION
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
            Verified corporate personnel roster totals <strong style={{ color: 'var(--accent-primary)' }}>{totalEmployees} members</strong> deployed across <strong style={{ color: 'var(--text-primary)' }}>{departmentsCount} functional units</strong>.
          </div>
        </div>

        {/* Step 2: Evidence */}
        <div style={{ background: 'var(--glass-bg-subtle)', padding: '14px 16px', borderRadius: 10, border: '1px solid var(--card-border)' }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--text-muted)', fontWeight: 700, marginBottom: 4 }}>
            2. ACCESS & ENGAGEMENT
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
            <strong style={{ color: 'var(--success)' }}>{activeCount} active</strong> and <strong style={{ color: 'var(--text-secondary)' }}>{remoteCount} remote</strong> verified contributors with 100% authenticated corporate domain identities.
          </div>
        </div>

        {/* Step 3: Recommended Action */}
        <div style={{ background: 'rgba(249, 115, 22, 0.04)', padding: '14px 16px', borderRadius: 10, border: '1px solid rgba(249, 115, 22, 0.2)' }}>
          <div style={{ fontSize: 10, fontFamily: 'monospace', color: 'var(--accent-primary)', fontWeight: 700, marginBottom: 4 }}>
            3. GOVERNANCE STATUS
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>
            Departmental coverage is balanced. Continue syncing corporate directory with enterprise IAM credentials.
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export interface OrgKpiData {
  label: string;
  value: string;
  detail: string;
  source: string;
  period: string;
  accent: string;
  icon: React.ReactNode;
}

export function OrgKpiGrid({ items, loading }: { items: OrgKpiData[]; loading?: boolean }) {
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

export function buildOrgKpiItems(
  employees: { status: 'active' | 'on-leave' | 'remote' }[],
  teams: { id: string }[],
  companyLocation: string
): OrgKpiData[] {
  const total = employees.length;
  const activeCount = employees.filter(e => e.status === 'active').length;

  return [
    {
      label: 'Verified Personnel',
      value: `${total}`,
      detail: `${activeCount} actively active onsite/relayed contributors`,
      source: 'Corporate Directory',
      period: 'Active headcount roster',
      accent: 'var(--accent-primary)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
      )
    }
  ];
}




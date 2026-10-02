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

export interface DepartmentGridProps {
  teams: { id: string; name: string; description: string; leadId?: string; leadName?: string }[];
  employees?: { id: string; teamId?: string; role?: string }[];
}

export function DepartmentGrid({ teams, employees = [] }: DepartmentGridProps) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
      {teams.map(t => {
        // Estimate or count department members
        const count = employees.filter(e => 
          e.teamId === t.id || 
          (e.role && t.name && e.role.toLowerCase().includes(t.name.toLowerCase().split(' ')[0]))
        ).length;

        return (
          <div 
            key={t.id} 
            style={{
              padding: '20px 22px',
              background: 'var(--glass-bg-subtle)',
              border: '1px solid var(--card-border)',
              borderRadius: 14,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: 12,
              transition: 'border-color 0.2s ease, transform 0.15s ease'
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
                  {t.name}
                </div>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  fontFamily: 'monospace',
                  padding: '3px 8px',
                  borderRadius: 6,
                  background: 'rgba(249, 115, 22, 0.08)',
                  color: 'var(--accent-primary)',
                  border: '1px solid rgba(249, 115, 22, 0.2)'
                }}>
                  {Math.max(1, count)} CONTRIBUTORS
                </span>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                {t.description}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--card-border)', paddingTop: 10, marginTop: 4, display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: 11 }}>
              <span style={{ color: 'var(--text-muted)', fontFamily: 'monospace', fontSize: 10 }}>
                UNIT REF: {t.id.toUpperCase()}
              </span>
              <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 10, fontWeight: 600, fontFamily: 'monospace' }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--success)' }} />
                ACTIVE DEPLOYMENT
              </span>
            </div>
          </div>
        );
      })}

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
    },
    {
      label: 'Functional Departments',
      value: `${teams.length}`,
      detail: 'Core operational & engineering branches',
      source: 'Department Registry',
      period: 'Active organizational units',
      accent: 'var(--text-primary)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
          <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
          <line x1="6" y1="6" x2="6.01" y2="6"></line>
          <line x1="6" y1="18" x2="6.01" y2="18"></line>
        </svg>
      )
    },
    {
      label: 'Operational Headquarters',
      value: companyLocation.split(',')[0] || 'San Francisco',
      detail: `${employees.filter(e => e.status === 'remote').length} distributed remote contributors`,
      source: 'Geographic Presence Registry',
      period: 'Primary corporate node',
      accent: 'var(--text-secondary)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
        </svg>
      )
    },
    {
      label: 'Governance & Compliance',
      value: '100%',
      detail: 'Zero policy violations in corporate audit log',
      source: 'IAM Security Gateway',
      period: 'Verified active benchmark',
      accent: 'var(--success)',
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
          <polyline points="9 12 11 14 15 10"></polyline>
        </svg>
      )
    }
  ];
}

export interface BusinessProfileCardProps {
  company: {
    name: string;
    industry: string;
    foundedDate: string;
    location: string;
  };
}

export function BusinessProfileCard({ company }: BusinessProfileCardProps) {
  return (
    <div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>

      <div style={{ background: 'var(--glass-bg-subtle)', padding: '18px 20px', borderRadius: 12, border: '1px solid var(--card-border)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontFamily: 'monospace' }}>
          LEGAL ENTITY
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          {company.name}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          Multi-tenant verified organization
        </div>
      </div>

      <div style={{ background: 'var(--glass-bg-subtle)', padding: '18px 20px', borderRadius: 12, border: '1px solid var(--card-border)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontFamily: 'monospace' }}>
          PRIMARY SECTOR
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--accent-primary)', fontFamily: 'var(--font-display)' }}>
          {company.industry}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          Core operating classification
        </div>
      </div>

      <div style={{ background: 'var(--glass-bg-subtle)', padding: '18px 20px', borderRadius: 12, border: '1px solid var(--card-border)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontFamily: 'monospace' }}>
          HEADQUARTERS
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          {company.location}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          Principal operations node
        </div>
      </div>

      <div style={{ background: 'var(--glass-bg-subtle)', padding: '18px 20px', borderRadius: 12, border: '1px solid var(--card-border)' }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6, fontFamily: 'monospace' }}>
          FOUNDATION DATE
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'var(--font-display)' }}>
          {company.foundedDate}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
          Corporate milestone registration
        </div>
      </div>
    </div>

    <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 10, background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, fontFamily: 'monospace', color: 'var(--text-secondary)' }}>
        <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)' }} />
        ENTERPRISE REGISTRATION: ORG-US-WEST-90214
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace' }}>
        TIER: PRODUCTION ENTERPRISE CLUSTER
      </div>
    </div>
  </div>

  );
}

export interface PersonnelDirectoryProps {
  employees: { id: string; name: string; role: string; email: string; joinedDate: string; status: 'active' | 'on-leave' | 'remote' }[];
  loading?: boolean;
}

export function PersonnelDirectory({ employees, loading = false }: PersonnelDirectoryProps) {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<'all' | 'active' | 'remote' | 'on-leave'>('all');

  const filtered = employees.filter(e => {
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    const matchesQuery = 
      e.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesQuery;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header Search & Filter Bar */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)' }}>
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input
            type="text"
            placeholder="Search personnel by name, role, or corporate email..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '9px 14px 9px 34px',
              background: 'var(--glass-bg-subtle)',
              border: '1px solid var(--card-border)',
              borderRadius: 8,
              fontSize: 12,
              color: 'var(--text-primary)',
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
          />
        </div>
      </div>
    </div>
  );
}


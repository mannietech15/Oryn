import { useState } from 'react';
import type { Company, Employee, Team } from '../types';

export default function OrganizationPage() {
  const [company, setCompany] = useState<Company>({
    name: 'Oryn AI Corp',
    industry: 'Technology / AI',
    foundedDate: '2025-01-15',
    location: 'San Francisco, CA'
  });

  const [employees, setEmployees] = useState<Employee[]>([
    { id: '1', name: 'Alex Chen', role: 'Chief Strategist', email: 'alex@oryn.ai', status: 'active', joinedDate: '2025-01-20' },
    { id: '2', name: 'Jordan Lee', role: 'Lead Data Scientist', email: 'jordan@oryn.ai', status: 'remote', joinedDate: '2025-02-01' },
    { id: '3', name: 'Sarah Miller', role: 'Operations Manager', email: 'sarah@oryn.ai', status: 'active', joinedDate: '2025-02-15' },
  ]);

  const [teams, setTeams] = useState<Team[]>([
    { id: 't1', name: 'Product Engineering', description: 'Core product development and AI integration.' },
    { id: 't2', name: 'Strategy & Growth', description: 'Business development and market expansion.' },
  ]);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: 40, display: 'flex', flexDirection: 'column', gap: 32 }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 700, letterSpacing: 3, color: 'var(--muted)', textTransform: 'uppercase', marginBottom: 8 }}>Entity Management</div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 800, color: 'white', letterSpacing: 1.5 }}>
            <span style={{ color: 'var(--cyan)' }}>{company.name}</span> · Organization
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button style={{ padding: '10px 20px', background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)', borderRadius: 10, color: 'var(--cyan)', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: 1, cursor: 'pointer' }}>
            + NEW TEAM
          </button>
          <button style={{ padding: '10px 24px', background: 'var(--cyan)', border: 'none', borderRadius: 10, color: 'var(--bg)', fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: 1, cursor: 'pointer', boxShadow: '0 0 15px rgba(0,240,255,0.4)' }}>
            ADD EMPLOYEE
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
        {/* Company Details Card */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, backdropFilter: 'blur(20px)', boxShadow: '0 10px 40px rgba(0,0,0,0.3)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: 24 }}><span className="color-circle"></span>Business Profile</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 40 }}>
            <div>
              <Label>Company Name</Label>
              <Value>{company.name}</Value>
            </div>
            <div>
              <Label>Industry Sector</Label>
              <Value>{company.industry}</Value>
            </div>
            <div>
              <Label>Operational HQ</Label>
              <Value>{company.location}</Value>
            </div>
            <div>
              <Label>Founded Date</Label>
              <Value>{company.foundedDate}</Value>
            </div>
          </div>
        </div>

        {/* Teams Overview */}
        <div style={{ background: 'rgba(7,20,40,0.4)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, backdropFilter: 'blur(10px)' }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: 'var(--violet)', textTransform: 'uppercase', marginBottom: 20 }}><span className="color-circle"></span>Active Teams</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {teams.map(t => (
              <div key={t.id} style={{ padding: 16, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = 'rgba(108,47,255,0.3)'; (e.currentTarget as HTMLDivElement).style.background = 'rgba(108,47,255,0.05)'; }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'white', marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: 11, color: 'var(--muted)', lineHeight: 1.4 }}>{t.description}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Employee Management Table */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: 'var(--cyan)', textTransform: 'uppercase' }}><span className="color-circle"></span>Workforce Directory</div>
          <div style={{ display: 'flex', gap: 8 }}>
            {['Active', 'Remote', 'Dept'].map(f => (
              <span key={f} style={{ fontSize: 10, fontWeight: 600, color: 'var(--muted)', border: '1px solid rgba(255,255,255,0.1)', padding: '4px 10px', borderRadius: 6, cursor: 'pointer' }}>{f} ▾</span>
            ))}
          </div>
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['Name', 'Role', 'Email', 'Status', 'Joined'].map(h => (
                <th key={h} style={{ textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--muted)', letterSpacing: 1.5, textTransform: 'uppercase', paddingBottom: 16, borderBottom: '1px solid rgba(0,240,255,0.1)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {employees.map(e => (
              <tr key={e.id} style={{ transition: 'background 0.2s' }} onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: 14, fontWeight: 600, color: 'white' }}>{e.name}</td>
                <td style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: 13, color: 'var(--text)' }}>{e.role}</td>
                <td style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: 13, color: 'var(--muted)' }}>{e.email}</td>
                <td style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
                  <span style={{ 
                    fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1,
                    padding: '4px 10px', borderRadius: 4, 
                    background: e.status === 'active' ? 'rgba(0,255,170,0.1)' : 'rgba(0,240,255,0.1)',
                    color: e.status === 'active' ? 'var(--success)' : 'var(--cyan)',
                    border: `1px solid ${e.status === 'active' ? 'rgba(0,255,170,0.2)' : 'rgba(0,240,255,0.2)'}`
                  }}>{e.status}</span>
                </td>
                <td style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.03)', fontSize: 13, color: 'var(--muted)', fontFamily: 'var(--font-display)' }}>{e.joinedDate}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: 'var(--muted)', letterSpacing: 1, marginBottom: 8, textTransform: 'uppercase' }}>{children}</div>;
}

function Value({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 18, fontWeight: 500, color: 'white', letterSpacing: 0.5 }}>{children}</div>;
}

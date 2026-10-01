import { useState, useEffect } from 'react';
import type { Company, Employee, Team } from '../types';
import { fetchOrganization } from '../api/oryn';

export default function OrganizationPage() {
  const [company, setCompany] = useState<Company>({
    name: 'Oryn AI Corp',
    industry: 'Enterprise AI & Workflow Systems',
    foundedDate: '2025-01-15',
    location: 'San Francisco, CA'
  });

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrganization()
      .then(data => {
        if (data.company) setCompany(data.company);
        if (data.employees) setEmployees(data.employees);
        if (data.teams) setTeams(data.teams);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
          <div style={{
            padding: '8px 16px', borderRadius: 8,
            background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)',
            color: 'var(--text-muted)', fontSize: 12, fontFamily: 'monospace'
          }}>
            {employees.length} Verified Team Members
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--muted)', textAlign: 'center', padding: 40 }}>
          Querying organization directory...
        </div>
      ) : (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: 24 }}>
            {/* Company Details Card */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, backdropFilter: 'blur(20px)', boxShadow: 'var(--shadow-subtle)' }}>
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
                  <Label>Foundation Date</Label>
                  <Value>{company.foundedDate}</Value>
                </div>
              </div>
            </div>

            {/* Teams */}
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, backdropFilter: 'blur(20px)', boxShadow: 'var(--shadow-subtle)' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: 24 }}><span className="color-circle"></span>Departments ({teams.length})</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                {teams.map(t => (
                  <div key={t.id} style={{ padding: '16px 20px', background: 'var(--glass-bg-subtle)', border: '1px solid var(--glass-bg-hover)', borderRadius: 12 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'white', marginBottom: 4 }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.4 }}>{t.description}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Employees Table */}
          <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 20, padding: 32, backdropFilter: 'blur(20px)', boxShadow: 'var(--shadow-subtle)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: 10, fontWeight: 700, letterSpacing: 2.5, color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: 24 }}><span className="color-circle"></span>Personnel Directory ({employees.length})</div>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--glass-bg-strong)' }}>
                  {['Name', 'Role', 'Email', 'Status', 'Joined'].map(h => (
                    <th key={h} style={{ padding: '12px 0', fontSize: 11, fontWeight: 700, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1.5 }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {employees.map(e => (
                  <tr key={e.id}>
                    <td style={{ padding: '20px 0', borderBottom: '1px solid var(--glass-bg-subtle)', fontSize: 14, fontWeight: 600, color: 'white' }}>{e.name}</td>
                    <td style={{ padding: '20px 0', borderBottom: '1px solid var(--glass-bg-subtle)', fontSize: 13, color: 'var(--text-secondary)' }}>{e.role}</td>
                    <td style={{ padding: '20px 0', borderBottom: '1px solid var(--glass-bg-subtle)', fontSize: 13, color: 'var(--muted)', fontFamily: 'monospace' }}>{e.email}</td>
                    <td style={{ padding: '20px 0', borderBottom: '1px solid var(--glass-bg-subtle)' }}>
                      <span style={{ 
                        padding: '4px 10px', borderRadius: 20, fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1,
                        background: 'rgba(0,255,170,0.1)', color: 'var(--success)', border: '1px solid rgba(0,255,170,0.3)'
                      }}>
                        {e.status}
                      </span>
                    </td>
                    <td style={{ padding: '20px 0', borderBottom: '1px solid var(--glass-bg-subtle)', fontSize: 13, color: 'var(--muted)' }}>{e.joinedDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{children}</div>;
}

function Value({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 16, fontWeight: 700, color: 'white' }}>{children}</div>;
}

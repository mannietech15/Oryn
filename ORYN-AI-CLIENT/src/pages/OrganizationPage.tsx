import { useState, useEffect } from 'react';
import { UserPlus, Download } from 'lucide-react';
import type { Company, Employee, Team } from '../types';

import { fetchOrganization, updateOrganizationData } from '../api/oryn';
import {
  OrgCard,
  GovernanceInsightSummary,
  OrgKpiGrid,
  buildOrgKpiItems,
  BusinessProfileCard,
  DepartmentGrid,
  PersonnelDirectory,
  AddMemberModal
} from '../components/OrganizationComponents';

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

  // Add Member Modal State
  const [showAddMember, setShowAddMember] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleAddMember = async (member: { name: string; role: string; email: string; status: 'active' | 'on-leave' | 'remote' }) => {
    setIsSubmitting(true);
    try {
      const addedEmployee: Employee = {
        id: `emp-${Date.now()}`,
        name: member.name,
        role: member.role || 'Staff Engineer',
        email: member.email,
        status: member.status,
        joinedDate: new Date().toISOString().split('T')[0]
      };

      const updatedList = [addedEmployee, ...employees];
      await updateOrganizationData({ employees: updatedList });

      setEmployees(updatedList);
      setShowAddMember(false);
    } catch (err) {
      console.error('Failed to add employee', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportRoster = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(employees, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `organization-roster-${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const activeCount = employees.filter(e => e.status === 'active').length;
  const remoteCount = employees.filter(e => e.status === 'remote').length;
  const kpiItems = buildOrgKpiItems(employees, teams, company.location);

  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '36px 40px', background: 'var(--bg)', position: 'relative' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>
        
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '3px 10px', borderRadius: 6,
                background: 'rgba(34, 197, 94, 0.08)', border: '1px solid rgba(34, 197, 94, 0.2)',
                fontSize: 11, fontWeight: 600, color: 'var(--success)', fontFamily: 'monospace'
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--success)', display: 'inline-block' }} />
                ENTITY MATRIX: VERIFIED
              </div>
              <div style={{
                padding: '3px 10px', borderRadius: 6,
                background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)',
                fontSize: 11, color: 'var(--text-muted)', fontFamily: 'monospace'
              }}>
                MULTI-TENANT DIRECTORY
              </div>
            </div>

            <div style={{ fontFamily: 'var(--font-display)', fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: -0.5 }}>
              Enterprise Organization & Governance Matrix
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 2 }}>
              Corporate structure, departmental hierarchy, and authenticated personnel credentials.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <div style={{
              padding: '6px 14px', borderRadius: 8,
              background: 'var(--glass-bg-subtle)', border: '1px solid var(--card-border)',
              color: 'var(--text-muted)', fontSize: 12, fontFamily: 'monospace'
            }}>
              ROSTER: <strong style={{ color: 'var(--text-primary)' }}>{employees.length} Members</strong>
            </div>
            <button
              onClick={handleExportRoster}
              style={{
                padding: '8px 14px', background: 'var(--glass-bg-subtle)', color: 'var(--text-secondary)',
                border: '1px solid var(--card-border)', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, transition: 'all 0.2s ease'
              }}
            >
              <Download size={14} /> Export
            </button>
            <button
              onClick={() => setShowAddMember(true)}
              style={{
                padding: '8px 18px', background: 'var(--accent-primary)', color: '#fff',
                border: 'none', borderRadius: 8, fontWeight: 600, fontSize: 13, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 8, boxShadow: 'var(--shadow-subtle)',
                transition: 'opacity 0.2s ease'
              }}
            >
              <UserPlus size={15} /> Enroll Contributor
            </button>
          </div>
        </div>


        {/* Evidence-oriented Workforce Governance Finding */}
        <GovernanceInsightSummary
          totalEmployees={employees.length}
          activeCount={activeCount}
          remoteCount={remoteCount}
          departmentsCount={teams.length}
          companyName={company.name}
        />

        {/* Top 4 Contextual KPIs */}
        <OrgKpiGrid items={kpiItems} loading={loading} />

        {/* 2-Column Section: Business Profile & Departments */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 1.15fr) minmax(320px, 1fr)', gap: 24, alignItems: 'start' }}>
          {/* Left Column: Business Profile */}
          <OrgCard 
            title="Enterprise Business Profile" 
            subtitle="Verified corporate registration and operational headquarters"
          >
            <BusinessProfileCard company={company} />
          </OrgCard>

          {/* Right Column: Departments */}
          <OrgCard 
            title="Departments & Functional Units" 
            subtitle={`Active operations across ${teams.length} branches`}
          >
            <DepartmentGrid teams={teams} employees={employees} />
          </OrgCard>
        </div>

        {/* Bottom Section: Personnel Directory Table */}
        <OrgCard 
          title="Personnel Directory & Access Registry" 
          subtitle={`Verified roster of ${employees.length} corporate contributors`}
        >
          <PersonnelDirectory employees={employees} loading={loading} />
        </OrgCard>

      </div>

      {/* Add Team Member Modal */}
      <AddMemberModal
        isOpen={showAddMember}
        onClose={() => setShowAddMember(false)}
        onSubmit={handleAddMember}
        isSubmitting={isSubmitting}
      />
    </div>
  );
}

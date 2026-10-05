import { describe, it, after } from 'node:test';
import assert from 'node:assert';
import { OrganizationService } from '../../src/modules/organization/organization.service';
import { prisma } from '../../src/infrastructure/database/prisma';

describe('OrganizationService Directory & Governance Suite', () => {
  const orgService = new OrganizationService();
  const testOrgId = 'org_oryn_global_001';

  after(async () => {
    try {
      await prisma.user.deleteMany({
        where: {
          orgId: testOrgId,
          email: { startsWith: 'test.contributor' }
        }
      });
    } catch {}
  });

  it('should retrieve corporate organization profile with employees and teams', async () => {
    const org = await orgService.getOrganization(testOrgId);
    assert.ok(org);
    assert.ok(org.company);
    assert.strictEqual(typeof org.company.name, 'string');
    assert.strictEqual(typeof org.company.industry, 'string');
    assert.ok(Array.isArray(org.employees));
    assert.ok(Array.isArray(org.teams));
  });

  it('should enroll a new employee contributor into the corporate roster', async () => {
    const uniqueEmail = `test.contributor.${Date.now()}@oryn.ai`;
    const employee = await orgService.addEmployee({
      orgId: testOrgId,
      name: 'Ada Lovelace',
      email: uniqueEmail,
      role: 'Staff ML Engineer',
    });

    assert.ok(employee);
    assert.ok(employee.id);
    assert.strictEqual(employee.name, 'Ada Lovelace');
    assert.strictEqual(employee.email, uniqueEmail);
    assert.strictEqual(employee.status, 'active');

    // Verify presence in refreshed organization roster
    const refreshed = await orgService.getOrganization(testOrgId);
    const found = refreshed.employees.find(e => e.email === uniqueEmail);
    assert.ok(found);
    assert.strictEqual(found?.name, 'Ada Lovelace');
  });

  it('should update company profile attributes and persist changes', async () => {
    const updated = await orgService.updateCompany({
      orgId: testOrgId,
      company: {
        name: 'Oryn AI Global Enterprise',
        industry: 'Enterprise Autonomous Intelligence',
        location: 'San Francisco, CA & London, UK',
      },
    });

    assert.ok(updated);
    assert.strictEqual(updated.company.name, 'Oryn AI Global Enterprise');
    assert.strictEqual(updated.company.industry, 'Enterprise Autonomous Intelligence');
    assert.strictEqual(updated.company.location, 'San Francisco, CA & London, UK');
  });

  it('should upsert and register functional departments into team registry', async () => {
    const testTeamName = 'Autonomous Agent Infrastructure';
    const updated = await orgService.updateCompany({
      orgId: testOrgId,
      teams: [
        {
          name: testTeamName,
          description: 'Specialized distributed runtime for autonomous sub-agents and tool loops.',
        },
      ],
    });

    assert.ok(updated);
    const team = updated.teams.find(t => t.name === testTeamName);
    assert.ok(team);
    assert.strictEqual(team?.name, testTeamName);
  });
});

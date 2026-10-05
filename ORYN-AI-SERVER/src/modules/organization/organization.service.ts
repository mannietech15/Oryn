import { prisma } from '../../infrastructure/database/prisma';
import { defaultDatastore } from '../../infrastructure/storage/datastore';
import { Logger } from '../../infrastructure/logging/logger';

const logger = new Logger('OrganizationService');

export class OrganizationService {
  private defaultOrgId = 'org_oryn_global_001';

  async getOrganization(orgId = this.defaultOrgId) {
    try {
      const org = await prisma.organization.findUnique({
        where: { id: orgId },
        include: {
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              avatarUrl: true,
              createdAt: true,
            },
          },
          teams: true,
        },
      });

      if (org) {
        return {
          company: {
            name: org.name,
            industry: org.industry,
            foundedDate: org.foundedDate.toISOString().split('T')[0],
            location: org.location,
          },
          employees: org.users.map((u) => ({
            id: u.id,
            name: u.name,
            email: u.email,
            role: u.role,
            status: 'active',
            joinedDate: u.createdAt.toISOString().split('T')[0],
            avatar: u.avatarUrl,
          })),
          teams: org.teams.map((t) => ({
            id: t.id,
            name: t.name,
            description: t.description,
          })),
        };
      }
    } catch (err: any) {
      logger.warn('Falling back to local datastore for organization', { error: err.message });
    }

    return {
      company: {
        name: 'Oryn AI Global Enterprise',
        industry: 'Enterprise Autonomous Intelligence',
        foundedDate: '2025-01-15',
        location: 'San Francisco, CA & London, UK',
      },
      employees: [],
      teams: [],
    };
  }

  async updateCompany(data: {
    orgId?: string;
    company?: { name?: string; industry?: string; foundedDate?: string; location?: string };
    employees?: any[];
    teams?: any[];
  }) {
    const orgId = data.orgId || this.defaultOrgId;

    try {
      if (data.company) {
        await prisma.organization.upsert({
          where: { id: orgId },
          update: {
            name: data.company.name,
            industry: data.company.industry,
            location: data.company.location,
            foundedDate: data.company.foundedDate ? new Date(data.company.foundedDate) : undefined,
          },
          create: {
            id: orgId,
            name: data.company.name || 'Oryn Enterprise',
            industry: data.company.industry || 'Technology',
            location: data.company.location || 'Global Remote',
            foundedDate: data.company.foundedDate ? new Date(data.company.foundedDate) : new Date(),
          },
        });
      }

      if (data.teams && Array.isArray(data.teams)) {
        for (const t of data.teams) {
          if (t.name) {
            const existingTeam = await prisma.team.findFirst({
              where: { orgId, name: t.name }
            });
            if (existingTeam) {
              await prisma.team.update({
                where: { id: existingTeam.id },
                data: { description: t.description || existingTeam.description }
              });
            } else {
              await prisma.team.create({
                data: { orgId, name: t.name, description: t.description || '' }
              });
            }
          }
        }
      }

      return await this.getOrganization(orgId);
    } catch (err: any) {
      logger.warn('Failed to update company in PostgreSQL, updating datastore', { error: err.message });
      return defaultDatastore.updateOrganization(data as any);
    }
  }

  async addEmployee(employee: { name: string; email: string; role: string; orgId?: string }) {
    const orgId = employee.orgId || this.defaultOrgId;
    try {
      const validRoles = ['SUPER_ADMIN', 'ORG_ADMIN', 'OPERATOR', 'AUDITOR', 'VIEWER'];
      const normalizedRole = validRoles.includes(employee.role?.toUpperCase())
        ? (employee.role.toUpperCase() as any)
        : 'OPERATOR';

      const created = await prisma.user.create({
        data: {
          orgId,
          name: employee.name,
          email: employee.email.toLowerCase(),
          passwordHash: 'pending_invitation',
          role: normalizedRole,
        },
      });

      return {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
        status: 'active',
        joinedDate: created.createdAt.toISOString().split('T')[0],
      };
    } catch {
      const org = defaultDatastore.getOrganization();
      const newEmp = {
        id: `emp-${Date.now()}`,
        name: employee.name,
        role: employee.role,
        email: employee.email,
        status: 'active',
        joinedDate: new Date().toISOString().split('T')[0],
      };
      org.employees.push(newEmp);
      defaultDatastore.updateOrganization({ employees: org.employees });
      return newEmp;
    }
  }

  async removeEmployee(id: string, orgId = this.defaultOrgId): Promise<boolean> {
    try {
      await prisma.user.deleteMany({
        where: { id, orgId }
      });
      return true;
    } catch {
      const org = defaultDatastore.getOrganization();
      org.employees = org.employees.filter(e => e.id !== id);
      defaultDatastore.updateOrganization({ employees: org.employees });
      return true;
    }
  }

  async deleteDepartment(id: string, orgId = this.defaultOrgId): Promise<boolean> {
    try {
      await prisma.team.deleteMany({
        where: { id, orgId }
      });
      return true;
    } catch {
      const org = defaultDatastore.getOrganization();
      org.teams = org.teams.filter(t => t.id !== id);
      defaultDatastore.updateOrganization({ teams: org.teams });
      return true;
    }
  }
}

export const defaultOrganizationService = new OrganizationService();

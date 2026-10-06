import { prisma } from '../../infrastructure/database/prisma';
import { defaultDatastore } from '../../infrastructure/storage/datastore';
import { Logger } from '../../infrastructure/logging/logger';

const logger = new Logger('FinancialsService');

export interface FinancialMetricResult {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  margin: number;
  entryCount: number;
  lastUpdated: string | null;
}

export class FinancialsService {
  private defaultOrgId = 'org_oryn_global_001';

  constructor() {
    this.ensureOrganization().catch(() => {});
  }

  async ensureOrganization(orgId = this.defaultOrgId): Promise<void> {
    try {
      const existing = await prisma.organization.findUnique({
        where: { id: orgId },
      });
      if (!existing) {
        await prisma.organization.create({
          data: {
            id: orgId,
            name: orgId === this.defaultOrgId ? 'Oryn AI Global' : 'Oryn Enterprise Node',
            industry: 'Enterprise AI & Workflow Systems',
            foundedDate: new Date('2025-01-15'),
            location: 'San Francisco, CA',
          },
        });
      }
    } catch {
      // Ignore if DB is still synchronizing
    }
  }

  async getLedger(orgId = this.defaultOrgId, range?: string) {
    try {
      let startDate: Date | undefined;
      if (range === '7D') {
        startDate = new Date(Date.now() - 7 * 86400000);
      } else if (range === '30D') {
        startDate = new Date(Date.now() - 30 * 86400000);
      } else if (range === '90D') {
        startDate = new Date(Date.now() - 90 * 86400000);
      } else if (range === '1Y') {
        startDate = new Date(Date.now() - 365 * 86400000);
      }

      const whereClause: any = { orgId };
      if (startDate) {
        whereClause.date = { gte: startDate };
      }

      const entries = await prisma.financialEntry.findMany({
        where: whereClause,
        orderBy: { date: 'desc' },
      });

      const metrics = await this.getMetrics(orgId, range);
      return {
        entries: entries.map((e) => ({
          id: e.id,
          type: e.type.toLowerCase(),
          category: e.category,
          amount: Number(e.amount),
          date: e.date.toISOString().split('T')[0],
          note: e.note || '',
          createdAt: e.createdAt.toISOString(),
        })),
        metrics,
      };
    } catch (err: any) {
      logger.warn('Falling back to local datastore for financials', { error: err.message });
    }

    // Fallback to local persistent datastore
    return {
      entries: defaultDatastore.getFinancialEntries(),
      metrics: defaultDatastore.getFinancialMetrics(),
    };
  }

  async addEntry(data: {
    type: 'revenue' | 'expense';
    category: string;
    amount: number;
    date?: string;
    note?: string;
    orgId?: string;
  }) {
    const orgId = data.orgId || this.defaultOrgId;
    const entryDate = data.date ? new Date(data.date) : new Date();

    try {
      await this.ensureOrganization(orgId);
      const created = await prisma.financialEntry.create({
        data: {
          orgId,
          type: data.type.toUpperCase() as 'REVENUE' | 'EXPENSE',
          category: data.category,
          amount: data.amount,
          date: entryDate,
          note: data.note || '',
        },
      });

      const metrics = await this.getMetrics(orgId);
      return {
        entry: {
          id: created.id,
          type: created.type.toLowerCase(),
          category: created.category,
          amount: Number(created.amount),
          date: created.date.toISOString().split('T')[0],
          note: created.note || '',
          createdAt: created.createdAt.toISOString(),
        },
        metrics,
      };
    } catch (err: any) {
      logger.warn('Failed to insert into PostgreSQL, persisting to datastore', { error: err.message });
      const entry = defaultDatastore.addFinancialEntry({
        type: data.type,
        category: data.category,
        amount: data.amount,
        date: data.date || new Date().toISOString().split('T')[0],
        note: data.note || '',
      });
      const metrics = defaultDatastore.getFinancialMetrics();
      return { entry, metrics };
    }
  }

  async getMetrics(orgId = this.defaultOrgId, range?: string): Promise<FinancialMetricResult> {
    try {
      let startDate: Date | undefined;
      if (range === '7D') {
        startDate = new Date(Date.now() - 7 * 86400000);
      } else if (range === '30D') {
        startDate = new Date(Date.now() - 30 * 86400000);
      } else if (range === '90D') {
        startDate = new Date(Date.now() - 90 * 86400000);
      } else if (range === '1Y') {
        startDate = new Date(Date.now() - 365 * 86400000);
      }

      const revWhere: any = { orgId, type: 'REVENUE' };
      const expWhere: any = { orgId, type: 'EXPENSE' };
      if (startDate) {
        revWhere.date = { gte: startDate };
        expWhere.date = { gte: startDate };
      }

      const revenueSum = await prisma.financialEntry.aggregate({
        where: revWhere,
        _sum: { amount: true },
        _count: { id: true },
      });

      const expenseSum = await prisma.financialEntry.aggregate({
        where: expWhere,
        _sum: { amount: true },
        _count: { id: true },
      });

      const totalRevenue = Number(revenueSum._sum.amount || 0);
      const totalExpenses = Number(expenseSum._sum.amount || 0);
      const netProfit = totalRevenue - totalExpenses;
      const margin = totalRevenue > 0 ? Number(((netProfit / totalRevenue) * 100).toFixed(1)) : 0;
      const entryCount = (revenueSum._count.id || 0) + (expenseSum._count.id || 0);

      const latest = await prisma.financialEntry.findFirst({
        where: { orgId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      });

      return {
        totalRevenue,
        totalExpenses,
        netProfit,
        margin,
        entryCount,
        lastUpdated: latest?.createdAt.toISOString() || null,
      };
    } catch {
      return defaultDatastore.getFinancialMetrics();
    }
  }
}

export const defaultFinancialsService = new FinancialsService();

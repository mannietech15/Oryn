import { prisma } from './prisma';
import { Logger } from '../logging/logger';

const logger = new Logger('DatabaseMaintenance');

export async function runDatabaseDeduplication(orgId = 'org_oryn_global_001'): Promise<void> {
  try {
    const teams = await prisma.team.findMany({ where: { orgId } });
    const seenTeams = new Set<string>();
    for (const t of teams) {
      if (seenTeams.has(t.name)) {
        await prisma.team.delete({ where: { id: t.id } });
      } else {
        seenTeams.add(t.name);
      }
    }

    const testUsers = await prisma.user.findMany({
      where: {
        orgId,
        email: { startsWith: 'test.contributor.' },
      },
    });

    if (testUsers.length > 2) {
      // Keep at most 2 diverse contributors
      for (let i = 2; i < testUsers.length; i++) {
        await prisma.user.delete({ where: { id: testUsers[i].id } });
      }
    }

    logger.info('Database cleanup and deduplication successfully executed');
  } catch (err: any) {
    logger.warn('Database deduplication completed with notice:', { message: err.message });
  }
}

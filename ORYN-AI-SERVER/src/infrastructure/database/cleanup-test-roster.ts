import { prisma } from './prisma';
import { Logger } from '../logging/logger';

const logger = new Logger('RosterMaintenance');

export async function purgeTestContributors(orgId = 'org_oryn_global_001'): Promise<number> {
  try {
    const res = await prisma.user.deleteMany({
      where: {
        orgId,
        email: { startsWith: 'test.contributor' }
      }
    });
    if (res.count > 0) {
      logger.info('Cleaned test contributor rows from organization roster', { orgId, count: res.count });
    }
    return res.count;
  } catch (err: any) {
    logger.warn('Failed to clean test contributors from database', { error: err.message });
    return 0;
  }
}

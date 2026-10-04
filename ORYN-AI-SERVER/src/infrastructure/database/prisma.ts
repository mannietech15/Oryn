import { PrismaClient } from '@prisma/client';
import { Logger } from '../logging/logger';

const logger = new Logger('PrismaClient');

declare global {
  // eslint-disable-next-line no-var
  var globalPrisma: PrismaClient | undefined;
}

export const prisma =
  global.globalPrisma ||
  new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'warn' },
    ],
  });

if (process.env.NODE_ENV !== 'production') {
  global.globalPrisma = prisma;
}

// @ts-ignore
prisma.$on('error', (e: any) => {
  logger.error('Prisma Error', { error: e.message });
});

export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('Connected to PostgreSQL Database via Prisma');
  } catch (err: any) {
    logger.error('Failed to connect to PostgreSQL Database', { error: err.message });
    throw err;
  }
}

export async function disconnectDatabase(): Promise<void> {
  await prisma.$disconnect();
  logger.info('Disconnected from PostgreSQL Database');
}

import { PrismaClient } from '@prisma/client';
import logger from './logger';

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

const prisma = global.prisma || new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

if (process.env.NODE_ENV === 'development') {
  logger.info('Prisma client initialized in development mode with logging');
}

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;

export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('🔌 Connected to database');
  } catch (error) {
    logger.info(process.env.DATABASE_URL)
    logger.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
}

export async function disconnectDB(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('🔌 Disconnected from database');
  } catch (error) {
    logger.error('❌ Error disconnecting from the database:', error);
    process.exit(1);
  }
}

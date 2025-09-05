import { PrismaClient } from '@prisma/client';
import logger from './logger';

// Prevent multiple instances of Prisma Client in development
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Create a singleton instance of PrismaClient
const prisma = global.prisma || new PrismaClient({
  log: [
    { level: 'query', emit: 'event' },
    { level: 'error', emit: 'stdout' },
    { level: 'info', emit: 'stdout' },
    { level: 'warn', emit: 'stdout' },
  ],
});

// Log queries in development environment
if (process.env.NODE_ENV === 'development') {
  // Using console for logging since event handlers are not working as expected
  logger.info('Prisma client initialized in development mode with logging');
}

// Save prisma client in global object in development to prevent multiple instances
if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}

export default prisma;

// Function to connect to the database
export async function connectDB(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('🔌 Connected to database');
  } catch (error) {
    logger.error('❌ Unable to connect to the database:', error);
    process.exit(1);
  }
}

// Function to disconnect from the database
export async function disconnectDB(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('🔌 Disconnected from database');
  } catch (error) {
    logger.error('❌ Error disconnecting from the database:', error);
    process.exit(1);
  }
}

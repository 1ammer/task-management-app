import dotenv from 'dotenv';
import { Server } from 'http';

dotenv.config();

import app from './app';
import logger from './utils/logger';
import { connectDB, disconnectDB } from './utils/prismaClient';

const port: number = parseInt(process.env.PORT || '3000', 10);

let server: Server;

connectDB()
  .then(() => {
    server = app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
      logger.info(`Environment: ${process.env.NODE_ENV}`);
    });
  })
  .catch((err) => {
    logger.error('Failed to start server:', err);
    process.exit(1);
  });

process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! Shutting down...');
  logger.error(err.name, err.message);
  if (server) {
    server.close(() => {
      disconnectDB().then(() => {
        process.exit(1);
      });
    });
  } else {
    disconnectDB().then(() => {
      process.exit(1);
    });
  }
});

process.on('SIGTERM', () => {
  logger.info('SIGTERM RECEIVED. Shutting down gracefully');
  if (server) {
    server.close(async () => {
      await disconnectDB();
      logger.info('Process terminated!');
    });
  } else {
    disconnectDB().then(() => {
      logger.info('Process terminated!');
    });
  }
});
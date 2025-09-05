import dotenv from 'dotenv';
import { Server } from 'http';

// Load environment variables
dotenv.config();

// Import the express app
import app from './app';
import logger from './utils/logger';

// Get port from environment and store in Express
const port: number = parseInt(process.env.PORT || '3000', 10);

// Start the server
const server: Server = app.listen(port, () => {
  logger.info(`Server running on port ${port}`);
  logger.info(`Environment: ${process.env.NODE_ENV}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});

// Handle SIGTERM signal
process.on('SIGTERM', () => {
  logger.info('SIGTERM RECEIVED. Shutting down gracefully');
  server.close(() => {
    logger.info('Process terminated!');
  });
});

export default server;
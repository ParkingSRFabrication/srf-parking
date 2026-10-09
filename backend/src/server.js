import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { ENV } from './config/env.js';
import { logger } from './config/logger.js';

async function startServer() {
  try {
    // Connect to database
    await connectDB();

    const server = app.listen(ENV.PORT, () => {
      logger.info(`=======================================================`);
      logger.info(`SR FABRICATION - Railway Station Parking Management System`);
      logger.info(`Server running in [${ENV.NODE_ENV}] mode on port [${ENV.PORT}]`);
      logger.info(`API Base URL: http://localhost:${ENV.PORT}/api`);
      logger.info(`Health check: http://localhost:${ENV.PORT}/api/health`);
      logger.info(`=======================================================`);
    });

    // Graceful shutdown handling
    const handleShutdown = async (signal) => {
      logger.info(`${signal} signal received. Gracefully closing HTTP server...`);
      server.close(async () => {
        logger.info('HTTP server closed.');
        await disconnectDB();
        process.exit(0);
      });

      // Force exit after 10s if graceful close hangs
      setTimeout(() => {
        logger.error('Forcefully terminating process after timeout.');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => handleShutdown('SIGTERM'));
    process.on('SIGINT', () => handleShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', { error: error.message });
    process.exit(1);
  }
}

startServer();

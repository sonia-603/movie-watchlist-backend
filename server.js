const { env, validateEnv } = require('./config/env');
const logger = require('./utils/logger');

try {
  validateEnv();
} catch (err) {
  logger.error(err.message);
  process.exit(1);
}

const app = require('./app');
const { connectDB, disconnectDB } = require('./config/db');

const start = async () => {
  try {
    await connectDB();
  } catch (err) {
    logger.error(`Could not connect to MongoDB: ${err.message}`);
    process.exit(1);
  }

  const server = app.listen(env.port, () => {
    logger.info(`API listening on port ${env.port} (${env.nodeEnv})`);
  });

  const shutdown = (signal) => {
    logger.info(`${signal} received, shutting down gracefully`);
    server.close(async () => {
      await disconnectDB().catch(() => {});
      process.exit(0);
    });
    setTimeout(() => process.exit(1), 10000).unref();
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
};

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled promise rejection:', reason);
});

start();

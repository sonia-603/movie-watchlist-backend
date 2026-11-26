const mongoose = require('mongoose');
const { env } = require('./env');
const logger = require('../utils/logger');

mongoose.set('strictQuery', true);

mongoose.connection.on('connected', () => logger.info('MongoDB connected'));
mongoose.connection.on('disconnected', () => logger.warn('MongoDB disconnected'));
mongoose.connection.on('error', (err) => logger.error('MongoDB error:', err.message));

const connectDB = async () => {
  await mongoose.connect(env.mongoUri, {
    serverSelectionTimeoutMS: 10000,
    maxPoolSize: 10,
  });
  // Make sure the unique index on tmdbId exists before we accept writes.
  await mongoose.connection.syncIndexes();
};

const disconnectDB = () => mongoose.connection.close(false);

module.exports = { connectDB, disconnectDB };

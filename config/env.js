const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const parseOrigins = (value = '') =>
  value
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);

const env = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  port: Number(process.env.PORT) || 3000,
  mongoUri: process.env.MONGODB_URI,
  clientUrls: parseOrigins(process.env.CLIENT_URL),
  tmdb: Object.freeze({
    readAccessToken: process.env.TMDB_READ_ACCESS_TOKEN || '',
    apiKey: process.env.TMDB_API_KEY || '',
    baseUrl: 'https://api.themoviedb.org/3',
    timeoutMs: 8000,
  }),
  uploads: Object.freeze({
    dir: path.resolve(__dirname, '..', 'uploads'),
    publicPath: '/uploads',
    maxFileSize: 2 * 1024 * 1024, // 2 MB
  }),
});

/**
 * Fails fast at boot when a required variable is missing, so a misconfigured
 * deployment never starts half-working.
 */
const validateEnv = () => {
  const problems = [];
  if (!env.mongoUri) problems.push('MONGODB_URI is required');
  if (!env.tmdb.readAccessToken && !env.tmdb.apiKey) {
    problems.push('TMDB_READ_ACCESS_TOKEN or TMDB_API_KEY is required');
  }
  if (env.isProduction && env.clientUrls.length === 0) {
    problems.push('CLIENT_URL is required in production (used for CORS)');
  }
  if (problems.length) {
    throw new Error(`Invalid environment configuration:\n - ${problems.join('\n - ')}`);
  }
};

module.exports = { env, validateEnv };

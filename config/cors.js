const { env } = require('./env');

const LOCALHOST_ORIGIN = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;

/** Only the deployed frontend(s) from CLIENT_URL and localhost may call the API from a browser. */
const isAllowedOrigin = (origin) => env.clientUrls.includes(origin) || LOCALHOST_ORIGIN.test(origin);

const corsOptions = {
  origin: (origin, callback) => {
    // Non-browser clients (uptime pinger, curl) send no Origin header.
    if (!origin) return callback(null, true);
    return callback(null, isAllowedOrigin(origin));
  },
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Accept'],
  maxAge: 600,
};

module.exports = { corsOptions, isAllowedOrigin };

const rateLimit = require('express-rate-limit');

const jsonHandler = (message) => (_req, res, _next, options) =>
  res.status(options.statusCode).json({ success: false, message });

/** General API protection. */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: jsonHandler('Too many requests. Please slow down and try again shortly.'),
});

/** Tighter limit for the TMDB proxy so our TMDB quota cannot be drained through us. */
const tmdbLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 60,
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: jsonHandler('Too many searches. Please wait a minute and try again.'),
});

module.exports = { apiLimiter, tmdbLimiter };

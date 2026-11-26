const multer = require('multer');
const { env } = require('../config/env');
const logger = require('../utils/logger');

const MULTER_MESSAGES = {
  LIMIT_FILE_SIZE: 'Poster image must be 2 MB or smaller',
  LIMIT_FILE_COUNT: 'Only one poster image can be uploaded at a time',
  LIMIT_UNEXPECTED_FILE: 'Unexpected file field. Use the field name "poster"',
};

/** Translates any thrown error into { statusCode, message, errors? }. */
const normalizeError = (err) => {
  if (err.isOperational) {
    return { statusCode: err.statusCode, message: err.message, errors: err.details };
  }
  if (err instanceof multer.MulterError) {
    return { statusCode: 400, message: MULTER_MESSAGES[err.code] || err.message };
  }
  if (err.name === 'CastError') {
    return { statusCode: 400, message: `Invalid value for ${err.path}` };
  }
  if (err.name === 'ValidationError' && err.errors) {
    const errors = Object.values(err.errors).map((e) => ({ field: e.path, message: e.message }));
    return { statusCode: 400, message: errors.map((e) => e.message).join('; '), errors };
  }
  if (err.code === 11000) {
    return { statusCode: 409, message: 'This movie is already in your watchlist' };
  }
  if (err.type === 'entity.parse.failed') {
    return { statusCode: 400, message: 'Malformed JSON in request body' };
  }
  if (err.type === 'entity.too.large') {
    return { statusCode: 413, message: 'Request body is too large' };
  }
  return { statusCode: 500, message: 'Something went wrong on our side. Please try again.' };
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, _next) => {
  const { statusCode, message, errors } = normalizeError(err);

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.originalUrl} -> ${statusCode}`, err);
  }

  const body = { success: false, message };
  if (errors && errors.length) body.errors = errors;
  if (!env.isProduction && statusCode === 500) body.stack = err.stack;

  res.status(statusCode).json(body);
};

module.exports = errorHandler;

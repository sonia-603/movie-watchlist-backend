/**
 * Operational error with an HTTP status code. Anything thrown as an AppError is
 * safe to show to the client; everything else is treated as an unexpected 500.
 */
class AppError extends Error {
  constructor(message, statusCode = 500, details) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;
    Error.captureStackTrace?.(this, this.constructor);
  }

  static badRequest(message, details) {
    return new AppError(message, 400, details);
  }

  static notFound(message = 'Resource not found') {
    return new AppError(message, 404);
  }

  static conflict(message) {
    return new AppError(message, 409);
  }
}

module.exports = AppError;

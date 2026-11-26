const AppError = require('../utils/AppError');

/**
 * Runs a pure validator against req[source]. On success the sanitised value is
 * stored on req.validated[source]; controllers read only from there.
 */
const validate = (validator, source = 'body') => (req, _res, next) => {
  const { value, errors } = validator(req[source]);
  if (errors.length) {
    const message =
      errors.length === 1 ? errors[0].message : `Validation failed: ${errors.map((e) => e.message).join('; ')}`;
    return next(AppError.badRequest(message, errors));
  }
  req.validated = { ...(req.validated || {}), [source]: value };
  return next();
};

module.exports = validate;

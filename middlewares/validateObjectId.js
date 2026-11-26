const AppError = require('../utils/AppError');

const OBJECT_ID_PATTERN = /^[a-f\d]{24}$/i;

/** router.param handler: rejects malformed Mongo ids with a 400 before any DB call or upload. */
const validateObjectId = (_req, _res, next, id) => {
  if (!OBJECT_ID_PATTERN.test(id)) return next(AppError.badRequest('Invalid watchlist item id'));
  return next();
};

module.exports = validateObjectId;

const {
  WATCH_STATUSES,
  RATING_MIN,
  RATING_MAX,
  NOTES_MAX_LENGTH,
  LIST_DEFAULT_LIMIT,
  LIST_MAX_LIMIT,
  SEARCH_TEXT_MAX_LENGTH,
} = require('../constants/watchlist');
const { isPlainObject, toInteger, parseBoundedInt } = require('./common');

/**
 * Each validator is a pure function: (input) => { value, errors }.
 * `value` is the sanitised payload the controller is allowed to use.
 */

const UPDATABLE_FIELDS = ['status', 'rating', 'notes'];

const validateAddToWatchlist = (body) => {
  const errors = [];
  if (!isPlainObject(body)) {
    return { value: {}, errors: [{ field: 'body', message: 'Request body must be a JSON object' }] };
  }

  const tmdbId = toInteger(body.tmdbId);
  if (body.tmdbId === undefined || body.tmdbId === null || body.tmdbId === '') {
    errors.push({ field: 'tmdbId', message: 'tmdbId is required' });
  } else if (Number.isNaN(tmdbId) || tmdbId < 1) {
    errors.push({ field: 'tmdbId', message: 'tmdbId must be a positive integer' });
  }

  return { value: { tmdbId }, errors };
};

const validateUpdateItem = (body) => {
  const errors = [];
  if (!isPlainObject(body)) {
    return { value: {}, errors: [{ field: 'body', message: 'Request body must be a JSON object' }] };
  }

  const unknown = Object.keys(body).filter((key) => !UPDATABLE_FIELDS.includes(key));
  unknown.forEach((key) => errors.push({ field: key, message: `Field "${key}" cannot be updated` }));

  if (!UPDATABLE_FIELDS.some((key) => key in body)) {
    errors.push({ field: 'body', message: 'Provide at least one of: status, rating, notes' });
  }

  const value = {};

  if ('status' in body) {
    if (!WATCH_STATUSES.includes(body.status)) {
      errors.push({ field: 'status', message: `status must be one of: ${WATCH_STATUSES.join(', ')}` });
    } else {
      value.status = body.status;
    }
  }

  if ('rating' in body) {
    if (body.rating === null || body.rating === '') {
      value.rating = null; // explicit clear
    } else {
      const rating = toInteger(body.rating);
      if (Number.isNaN(rating) || rating < RATING_MIN || rating > RATING_MAX) {
        errors.push({
          field: 'rating',
          message: `rating must be a whole number from ${RATING_MIN} to ${RATING_MAX}`,
        });
      } else {
        value.rating = rating;
      }
    }
  }

  if ('notes' in body) {
    if (body.notes === null) {
      value.notes = '';
    } else if (typeof body.notes !== 'string') {
      errors.push({ field: 'notes', message: 'notes must be a string' });
    } else if (body.notes.trim().length > NOTES_MAX_LENGTH) {
      errors.push({ field: 'notes', message: `notes cannot exceed ${NOTES_MAX_LENGTH} characters` });
    } else {
      value.notes = body.notes.trim();
    }
  }

  // Cross-field rule when both are sent in the same request. The service also
  // checks it against the stored status when only the rating is sent.
  if (value.status && value.status !== 'done' && value.rating != null) {
    errors.push({ field: 'rating', message: 'Rating can only be set when status is "done"' });
  }

  return { value, errors };
};

const validateListQuery = (query = {}) => {
  const errors = [];
  const value = {};

  const { status, search } = query;
  if (Array.isArray(status) || Array.isArray(search)) {
    errors.push({ field: 'query', message: 'Each filter can only be provided once' });
    return { value, errors };
  }

  if (status !== undefined && status !== '' && status !== 'all') {
    if (!WATCH_STATUSES.includes(status)) {
      errors.push({ field: 'status', message: `status must be one of: all, ${WATCH_STATUSES.join(', ')}` });
    } else {
      value.status = status;
    }
  }

  if (search !== undefined) {
    const text = String(search).trim();
    if (text.length > SEARCH_TEXT_MAX_LENGTH) {
      errors.push({ field: 'search', message: `search cannot exceed ${SEARCH_TEXT_MAX_LENGTH} characters` });
    } else if (text) {
      value.search = text;
    }
  }

  value.page = parseBoundedInt(query.page, { field: 'page', defaultValue: 1, min: 1, max: 10000 }, errors);
  value.limit = parseBoundedInt(
    query.limit,
    { field: 'limit', defaultValue: LIST_DEFAULT_LIMIT, min: 1, max: LIST_MAX_LIMIT },
    errors,
  );

  return { value, errors };
};

module.exports = { validateAddToWatchlist, validateUpdateItem, validateListQuery };

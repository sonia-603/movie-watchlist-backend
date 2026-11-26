const { SEARCH_TEXT_MAX_LENGTH } = require('../constants/watchlist');
const { TMDB_MAX_PAGE } = require('../constants/tmdb');
const { toInteger, parseBoundedInt } = require('./common');

const validateSearchQuery = (query = {}) => {
  const errors = [];
  const value = {};

  if (Array.isArray(query.query)) {
    return { value, errors: [{ field: 'query', message: 'query can only be provided once' }] };
  }

  const text = typeof query.query === 'string' ? query.query.trim() : '';
  if (!text) {
    errors.push({ field: 'query', message: 'Search query is required' });
  } else if (text.length > SEARCH_TEXT_MAX_LENGTH) {
    errors.push({ field: 'query', message: `Search query cannot exceed ${SEARCH_TEXT_MAX_LENGTH} characters` });
  } else {
    value.query = text;
  }

  value.page = parseBoundedInt(query.page, { field: 'page', defaultValue: 1, min: 1, max: TMDB_MAX_PAGE }, errors);

  return { value, errors };
};

const validateTmdbIdParam = (params = {}) => {
  const tmdbId = toInteger(params.tmdbId);
  if (Number.isNaN(tmdbId) || tmdbId < 1) {
    return { value: {}, errors: [{ field: 'tmdbId', message: 'tmdbId must be a positive integer' }] };
  }
  return { value: { tmdbId }, errors: [] };
};

module.exports = { validateSearchQuery, validateTmdbIdParam };

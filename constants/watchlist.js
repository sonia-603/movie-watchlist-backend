const WATCH_STATUSES = Object.freeze(['to_watch', 'watching', 'done']);
const POSTER_SOURCES = Object.freeze(['tmdb', 'custom']);

const RATING_MIN = 1;
const RATING_MAX = 10;
const NOTES_MAX_LENGTH = 500;

const LIST_DEFAULT_LIMIT = 20;
const LIST_MAX_LIMIT = 100;
const SEARCH_TEXT_MAX_LENGTH = 100;

const ALLOWED_POSTER_TYPES = Object.freeze({
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
});

module.exports = {
  WATCH_STATUSES,
  POSTER_SOURCES,
  RATING_MIN,
  RATING_MAX,
  NOTES_MAX_LENGTH,
  LIST_DEFAULT_LIMIT,
  LIST_MAX_LIMIT,
  SEARCH_TEXT_MAX_LENGTH,
  ALLOWED_POSTER_TYPES,
};

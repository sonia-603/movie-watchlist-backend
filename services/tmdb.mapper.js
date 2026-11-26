const { TMDB_IMAGE_BASE_URL, TMDB_BACKDROP_BASE_URL, TMDB_MAX_PAGE } = require('../constants/tmdb');

/** Pure functions that turn raw TMDB payloads into the shapes our API exposes. */

const buildImageUrl = (path, base = TMDB_IMAGE_BASE_URL) => (path ? `${base}${path}` : null);

const yearFrom = (releaseDate) =>
  typeof releaseDate === 'string' && /^\d{4}/.test(releaseDate) ? Number(releaseDate.slice(0, 4)) : null;

const mapSearchResult = (movie) => ({
  tmdbId: movie.id,
  title: movie.title || movie.original_title || 'Untitled',
  overview: movie.overview || '',
  releaseDate: movie.release_date || null,
  year: yearFrom(movie.release_date),
  posterUrl: buildImageUrl(movie.poster_path),
});

const mapSearchResponse = (payload = {}) => ({
  results: Array.isArray(payload.results) ? payload.results.map(mapSearchResult) : [],
  page: payload.page || 1,
  totalPages: Math.min(payload.total_pages || 0, TMDB_MAX_PAGE),
  totalResults: payload.total_results || 0,
});

const mapMovieDetails = (movie) => ({
  tmdbId: movie.id,
  title: movie.title || movie.original_title || 'Untitled',
  overview: movie.overview || '',
  releaseDate: movie.release_date || null,
  year: yearFrom(movie.release_date),
  genres: Array.isArray(movie.genres) ? movie.genres.map((genre) => genre.name).filter(Boolean) : [],
  posterUrl: buildImageUrl(movie.poster_path),
  backdropUrl: buildImageUrl(movie.backdrop_path, TMDB_BACKDROP_BASE_URL),
  tagline: movie.tagline || '',
  runtime: movie.runtime || null,
  voteAverage: typeof movie.vote_average === 'number' ? movie.vote_average : null,
  voteCount: movie.vote_count || 0,
  originalLanguage: movie.original_language || null,
});

module.exports = { buildImageUrl, yearFrom, mapSearchResult, mapSearchResponse, mapMovieDetails };

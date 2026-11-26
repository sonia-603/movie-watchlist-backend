const { env } = require('../config/env');
const AppError = require('../utils/AppError');
const logger = require('../utils/logger');
const { mapSearchResponse, mapMovieDetails } = require('./tmdb.mapper');

/**
 * All communication with TMDB lives here. Credentials are read from the
 * server environment and are never returned to, or logged for, the client.
 */

const buildUrl = (pathname, params = {}) => {
  const url = new URL(`${env.tmdb.baseUrl}${pathname}`);
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
  });
  // Fallback auth when no Bearer token is configured.
  if (!env.tmdb.readAccessToken && env.tmdb.apiKey) url.searchParams.set('api_key', env.tmdb.apiKey);
  return url;
};

const buildHeaders = () => {
  const headers = { accept: 'application/json' };
  if (env.tmdb.readAccessToken) headers.Authorization = `Bearer ${env.tmdb.readAccessToken}`;
  return headers;
};

const toAppError = (status, pathname) => {
  switch (status) {
    case 404:
      return AppError.notFound('Movie not found on TMDB');
    case 401:
    case 403:
      logger.error(`TMDB rejected credentials (HTTP ${status}) for ${pathname}`);
      return new AppError('Movie service is misconfigured. Please try again later.', 502);
    case 429:
      return new AppError('Movie service is busy right now. Please try again in a moment.', 503);
    default:
      logger.error(`TMDB responded with HTTP ${status} for ${pathname}`);
      return new AppError('Movie service is unavailable right now. Please try again later.', 502);
  }
};

const request = async (pathname, params) => {
  if (!env.tmdb.readAccessToken && !env.tmdb.apiKey) {
    throw new AppError('Movie service is not configured.', 503);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), env.tmdb.timeoutMs);

  let response;
  try {
    response = await fetch(buildUrl(pathname, params), {
      headers: buildHeaders(),
      signal: controller.signal,
    });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new AppError('Movie service took too long to respond. Please try again.', 504);
    }
    logger.error(`TMDB network error for ${pathname}: ${err.message}`);
    throw new AppError('Could not reach the movie service. Please try again later.', 502);
  } finally {
    clearTimeout(timer);
  }

  if (!response.ok) throw toAppError(response.status, pathname);

  try {
    return await response.json();
  } catch {
    throw new AppError('Movie service returned an invalid response.', 502);
  }
};

const searchMovies = async (query, page = 1) => {
  const payload = await request('/search/movie', {
    query,
    page,
    include_adult: false,
    language: 'en-US',
  });
  return mapSearchResponse(payload);
};

const getMovieDetails = async (tmdbId) => {
  const payload = await request(`/movie/${encodeURIComponent(tmdbId)}`, { language: 'en-US' });
  return mapMovieDetails(payload);
};

module.exports = { searchMovies, getMovieDetails };

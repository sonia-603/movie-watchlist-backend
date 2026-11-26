const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const tmdbService = require('../services/tmdb.service');
const watchlistService = require('../services/watchlist.service');

/** GET /api/tmdb/search?query=&page= */
const searchMovies = asyncHandler(async (req, res) => {
  const { query, page } = req.validated.query;
  const { results, ...pagination } = await tmdbService.searchMovies(query, page);
  const annotated = await watchlistService.annotateSearchResults(results);
  sendSuccess(res, annotated, { meta: { query, ...pagination } });
});

/** GET /api/tmdb/movie/:tmdbId */
const getMovieDetails = asyncHandler(async (req, res) => {
  const movie = await tmdbService.getMovieDetails(req.validated.params.tmdbId);
  sendSuccess(res, movie);
});

module.exports = { searchMovies, getMovieDetails };

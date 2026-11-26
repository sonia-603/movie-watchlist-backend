const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');
const watchlistService = require('../services/watchlist.service');

/** POST /api/watchlist  body: { tmdbId } */
const addItem = asyncHandler(async (req, res) => {
  const item = await watchlistService.addFromTmdb(req.validated.body.tmdbId);
  sendSuccess(res, item, { statusCode: 201, message: 'Movie added to your watchlist' });
});

/** GET /api/watchlist?status=&search=&page=&limit= */
const listItems = asyncHandler(async (req, res) => {
  const { items, meta } = await watchlistService.list(req.validated.query);
  sendSuccess(res, items, { meta });
});

/** GET /api/watchlist/:id */
const getItem = asyncHandler(async (req, res) => {
  const item = await watchlistService.getById(req.params.id);
  sendSuccess(res, item);
});

/** PUT /api/watchlist/:id  body: { status?, rating?, notes? } */
const updateItem = asyncHandler(async (req, res) => {
  const item = await watchlistService.update(req.params.id, req.validated.body);
  sendSuccess(res, item, { message: 'Watchlist item updated' });
});

/** PATCH /api/watchlist/:id/poster  multipart field: poster */
const uploadPoster = asyncHandler(async (req, res) => {
  const item = await watchlistService.replacePoster(req.params.id, req.file);
  sendSuccess(res, item, { message: 'Custom poster uploaded' });
});

/** DELETE /api/watchlist/:id/poster — revert to the TMDB poster */
const resetPoster = asyncHandler(async (req, res) => {
  const item = await watchlistService.resetPoster(req.params.id);
  sendSuccess(res, item, { message: 'Poster reset to the TMDB original' });
});

/** DELETE /api/watchlist/:id */
const deleteItem = asyncHandler(async (req, res) => {
  const item = await watchlistService.remove(req.params.id);
  sendSuccess(res, { id: item.id }, { message: 'Movie removed from your watchlist' });
});

module.exports = { addItem, listItems, getItem, updateItem, uploadPoster, resetPoster, deleteItem };

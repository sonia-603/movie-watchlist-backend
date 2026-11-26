const WatchlistItem = require('../models/WatchlistItem');
const AppError = require('../utils/AppError');
const escapeRegex = require('../utils/escapeRegex');
const tmdbService = require('./tmdb.service');
const fileService = require('./file.service');
const { WATCH_STATUSES } = require('../constants/watchlist');

const DUPLICATE_MESSAGE = 'This movie is already in your watchlist';

const parseReleaseDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
};

const findByIdOrThrow = async (id) => {
  const item = await WatchlistItem.findById(id);
  if (!item) throw AppError.notFound('Watchlist item not found');
  return item;
};

/** Imports a movie from TMDB. Title, overview, release date, genres and poster are copied. */
const addFromTmdb = async (tmdbId) => {
  // Cheap check first, so we don't call TMDB for an obvious duplicate.
  if (await WatchlistItem.exists({ tmdbId })) throw AppError.conflict(DUPLICATE_MESSAGE);

  const movie = await tmdbService.getMovieDetails(tmdbId);

  try {
    return await WatchlistItem.create({
      tmdbId: movie.tmdbId,
      title: movie.title,
      overview: movie.overview,
      releaseDate: parseReleaseDate(movie.releaseDate),
      genres: movie.genres,
      posterUrl: movie.posterUrl,
      tmdbPosterUrl: movie.posterUrl,
      posterSource: 'tmdb',
      status: 'to_watch',
    });
  } catch (err) {
    // Unique index guards against a race between two simultaneous imports.
    if (err.code === 11000) throw AppError.conflict(DUPLICATE_MESSAGE);
    throw err;
  }
};

const list = async ({ status, search, page, limit }) => {
  const baseFilter = search ? { title: { $regex: escapeRegex(search), $options: 'i' } } : {};
  const filter = status ? { ...baseFilter, status } : baseFilter;

  const [items, total, statusCounts] = await Promise.all([
    WatchlistItem.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    WatchlistItem.countDocuments(filter),
    WatchlistItem.aggregate([{ $match: baseFilter }, { $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);

  const counts = Object.fromEntries(WATCH_STATUSES.map((s) => [s, 0]));
  statusCounts.forEach(({ _id, count }) => {
    if (_id in counts) counts[_id] = count;
  });
  counts.all = Object.values(counts).reduce((sum, n) => sum + n, 0);

  return {
    items,
    meta: {
      pagination: { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) },
      counts,
    },
  };
};

const getById = (id) => findByIdOrThrow(id);

/**
 * Updates status / rating / notes.
 * Rule: a rating is only allowed when the (resulting) status is "done".
 * Moving an item away from "done" clears its rating automatically.
 */
const update = async (id, changes) => {
  const item = await findByIdOrThrow(id);
  const nextStatus = changes.status ?? item.status;
  const ratingProvided = Object.prototype.hasOwnProperty.call(changes, 'rating');

  if (ratingProvided && changes.rating !== null && nextStatus !== 'done') {
    throw AppError.badRequest('Rating can only be set when status is "done"', [
      { field: 'rating', message: 'Rating can only be set when status is "done"' },
    ]);
  }

  item.status = nextStatus;
  if (nextStatus !== 'done') {
    item.rating = undefined;
  } else if (ratingProvided) {
    item.rating = changes.rating === null ? undefined : changes.rating;
  }
  if (changes.notes !== undefined) item.notes = changes.notes;

  return item.save();
};

/** Stores a new custom poster and removes the previous custom file (if any). */
const replacePoster = async (id, file) => {
  const item = await WatchlistItem.findById(id);
  if (!item) {
    await fileService.deleteFileAtPath(file.path);
    throw AppError.notFound('Watchlist item not found');
  }

  const previousCustomPoster = item.posterSource === 'custom' ? item.posterUrl : null;
  item.posterUrl = fileService.toPublicPath(file.filename);
  item.posterSource = 'custom';

  try {
    await item.save();
  } catch (err) {
    await fileService.deleteFileAtPath(file.path);
    throw err;
  }

  if (previousCustomPoster) await fileService.deleteUploadedPoster(previousCustomPoster);
  return item;
};

/** Removes the custom poster and goes back to the original TMDB poster. */
const resetPoster = async (id) => {
  const item = await findByIdOrThrow(id);
  if (item.posterSource !== 'custom') {
    throw AppError.badRequest('This item is already using the TMDB poster');
  }

  const customPoster = item.posterUrl;
  item.posterUrl = item.tmdbPosterUrl;
  item.posterSource = 'tmdb';
  await item.save();
  await fileService.deleteUploadedPoster(customPoster);
  return item;
};

const remove = async (id) => {
  const item = await WatchlistItem.findByIdAndDelete(id);
  if (!item) throw AppError.notFound('Watchlist item not found');
  if (item.posterSource === 'custom') await fileService.deleteUploadedPoster(item.posterUrl);
  return item;
};

/** Adds `watchlistId` to TMDB search results so the UI knows what is already saved. */
const annotateSearchResults = async (results) => {
  if (!results.length) return results;
  const saved = await WatchlistItem.find(
    { tmdbId: { $in: results.map((r) => r.tmdbId) } },
    { tmdbId: 1 },
  ).lean();
  const savedIds = new Map(saved.map((doc) => [doc.tmdbId, doc._id.toString()]));
  return results.map((result) => ({ ...result, watchlistId: savedIds.get(result.tmdbId) || null }));
};

module.exports = {
  addFromTmdb,
  list,
  getById,
  update,
  replacePoster,
  resetPoster,
  remove,
  annotateSearchResults,
};

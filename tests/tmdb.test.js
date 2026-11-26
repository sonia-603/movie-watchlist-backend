const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const { mapSearchResponse, mapMovieDetails, yearFrom } = require('../services/tmdb.mapper');
const { validateSearchQuery, validateTmdbIdParam } = require('../validators/tmdb.validators');

describe('tmdb.mapper', () => {
  test('maps search results and handles a null poster_path', () => {
    const mapped = mapSearchResponse({
      page: 1,
      total_pages: 900,
      total_results: 2,
      results: [
        { id: 603, title: 'The Matrix', overview: 'Neo...', release_date: '1999-03-30', poster_path: '/m.jpg' },
        { id: 1, title: 'No Poster', overview: null, release_date: '', poster_path: null },
      ],
    });

    assert.equal(mapped.totalPages, 500, 'TMDB caps searches at 500 pages');
    assert.deepEqual(mapped.results[0], {
      tmdbId: 603,
      title: 'The Matrix',
      overview: 'Neo...',
      releaseDate: '1999-03-30',
      year: 1999,
      posterUrl: 'https://image.tmdb.org/t/p/w500/m.jpg',
    });
    assert.equal(mapped.results[1].posterUrl, null);
    assert.equal(mapped.results[1].year, null);
    assert.equal(mapped.results[1].overview, '');
  });

  test('maps genres from [{ id, name }] to names', () => {
    const details = mapMovieDetails({
      id: 550,
      title: 'Fight Club',
      genres: [
        { id: 18, name: 'Drama' },
        { id: 53, name: 'Thriller' },
      ],
      poster_path: null,
    });
    assert.deepEqual(details.genres, ['Drama', 'Thriller']);
    assert.equal(details.posterUrl, null);
  });

  test('yearFrom ignores empty or malformed dates', () => {
    assert.equal(yearFrom('2010-07-15'), 2010);
    assert.equal(yearFrom(''), null);
    assert.equal(yearFrom(undefined), null);
  });
});

describe('tmdb.validators', () => {
  test('requires a non-empty query', () => {
    assert.equal(validateSearchQuery({ query: '   ' }).errors[0].field, 'query');
  });

  test('accepts a query with default page', () => {
    assert.deepEqual(validateSearchQuery({ query: ' dune ' }), { value: { query: 'dune', page: 1 }, errors: [] });
  });

  test('rejects pages beyond TMDB limit', () => {
    assert.equal(validateSearchQuery({ query: 'x', page: '501' }).errors[0].field, 'page');
  });

  test('validates tmdbId params', () => {
    assert.deepEqual(validateTmdbIdParam({ tmdbId: '603' }).value, { tmdbId: 603 });
    assert.equal(validateTmdbIdParam({ tmdbId: '../etc' }).errors.length, 1);
  });
});

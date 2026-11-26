const { test, describe } = require('node:test');
const assert = require('node:assert/strict');
const {
  validateAddToWatchlist,
  validateUpdateItem,
  validateListQuery,
} = require('../validators/watchlist.validators');

describe('validateAddToWatchlist', () => {
  test('accepts a numeric tmdbId', () => {
    assert.deepEqual(validateAddToWatchlist({ tmdbId: 550 }), { value: { tmdbId: 550 }, errors: [] });
  });

  test('accepts a numeric string tmdbId', () => {
    assert.equal(validateAddToWatchlist({ tmdbId: '27205' }).value.tmdbId, 27205);
  });

  test('rejects missing, negative, decimal and non-numeric ids', () => {
    for (const tmdbId of [undefined, -4, 0, 1.5, 'abc', '12abc', null]) {
      assert.equal(validateAddToWatchlist({ tmdbId }).errors.length, 1, `tmdbId=${tmdbId}`);
    }
  });

  test('rejects a non-object body', () => {
    assert.equal(validateAddToWatchlist(undefined).errors[0].field, 'body');
  });
});

describe('validateUpdateItem', () => {
  test('accepts a valid full update', () => {
    const { value, errors } = validateUpdateItem({ status: 'done', rating: 8, notes: '  Great film  ' });
    assert.deepEqual(errors, []);
    assert.deepEqual(value, { status: 'done', rating: 8, notes: 'Great film' });
  });

  test('rejects an unknown status', () => {
    assert.equal(validateUpdateItem({ status: 'finished' }).errors[0].field, 'status');
  });

  test('rejects rating outside 1-10 or non-integer', () => {
    for (const rating of [0, 11, 7.5, 'ten', -1]) {
      const { errors } = validateUpdateItem({ status: 'done', rating });
      assert.equal(errors[0].field, 'rating', `rating=${rating}`);
    }
  });

  test('rejects a rating when the new status is not done', () => {
    const { errors } = validateUpdateItem({ status: 'watching', rating: 6 });
    assert.match(errors[0].message, /only be set when status is "done"/);
  });

  test('allows clearing the rating with null', () => {
    assert.deepEqual(validateUpdateItem({ rating: null }).value, { rating: null });
  });

  test('enforces the 500 character notes limit', () => {
    assert.equal(validateUpdateItem({ notes: 'a'.repeat(500) }).errors.length, 0);
    assert.equal(validateUpdateItem({ notes: 'a'.repeat(501) }).errors[0].field, 'notes');
  });

  test('rejects fields that cannot be updated', () => {
    const { errors } = validateUpdateItem({ title: 'Hacked', status: 'done' });
    assert.equal(errors[0].field, 'title');
  });

  test('requires at least one updatable field', () => {
    assert.equal(validateUpdateItem({}).errors[0].field, 'body');
  });
});

describe('validateListQuery', () => {
  test('applies defaults', () => {
    assert.deepEqual(validateListQuery({}), { value: { page: 1, limit: 20 }, errors: [] });
  });

  test('treats "all" as no status filter', () => {
    assert.equal(validateListQuery({ status: 'all' }).value.status, undefined);
  });

  test('rejects an unknown status', () => {
    assert.equal(validateListQuery({ status: 'nope' }).errors[0].field, 'status');
  });

  test('trims the search text and drops it when empty', () => {
    assert.equal(validateListQuery({ search: '  matrix ' }).value.search, 'matrix');
    assert.equal(validateListQuery({ search: '   ' }).value.search, undefined);
  });

  test('rejects repeated query params (array injection)', () => {
    assert.equal(validateListQuery({ status: ['done', 'watching'] }).errors.length, 1);
  });

  test('rejects an out of range limit', () => {
    assert.equal(validateListQuery({ limit: '500' }).errors[0].field, 'limit');
  });
});

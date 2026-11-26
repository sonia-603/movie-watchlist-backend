const { Router } = require('express');
const controller = require('../controllers/tmdb.controller');
const validate = require('../middlewares/validate');
const { tmdbLimiter } = require('../middlewares/rateLimiter');
const { validateSearchQuery, validateTmdbIdParam } = require('../validators/tmdb.validators');

const router = Router();

router.use(tmdbLimiter);

router.get('/search', validate(validateSearchQuery, 'query'), controller.searchMovies);
router.get('/movie/:tmdbId', validate(validateTmdbIdParam, 'params'), controller.getMovieDetails);

module.exports = router;

const { Router } = require('express');
const tmdbRoutes = require('./tmdb.routes');
const watchlistRoutes = require('./watchlist.routes');
const { apiLimiter } = require('../middlewares/rateLimiter');

const router = Router();

router.use(apiLimiter);
router.use('/tmdb', tmdbRoutes);
router.use('/watchlist', watchlistRoutes);

module.exports = router;

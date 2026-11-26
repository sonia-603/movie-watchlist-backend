const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const morgan = require('morgan');

const { env } = require('./config/env');
const { corsOptions } = require('./config/cors');
const healthRoutes = require('./routes/health.routes');
const apiRoutes = require('./routes');
const notFound = require('./middlewares/notFound');
const errorHandler = require('./middlewares/errorHandler');

const app = express();

app.disable('x-powered-by');
// Render / Vercel sit behind a proxy; needed for correct client IPs in rate limiting.
app.set('trust proxy', 1);

app.use(
  helmet({
    // Posters are loaded by the frontend from a different origin.
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(cors(corsOptions));
app.use(express.json({ limit: '100kb' }));
if (env.nodeEnv !== 'test') app.use(morgan(env.isProduction ? 'combined' : 'dev'));

app.get('/', (_req, res) => {
  res.json({ success: true, message: 'Movie Watchlist API', health: '/health', api: '/api' });
});

app.use('/health', healthRoutes);

app.use(
  env.uploads.publicPath,
  express.static(env.uploads.dir, {
    index: false,
    dotfiles: 'deny',
    maxAge: '7d',
    immutable: true, // file names are unique, so the content behind a URL never changes
  }),
);

app.use('/api', apiRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;

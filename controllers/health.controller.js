const mongoose = require('mongoose');

const DB_STATES = {
  0: 'disconnected',
  1: 'connected',
  2: 'connecting',
  3: 'disconnecting',
};

/** GET /health — used by the uptime pinger. Always 200; `db` reports the real Mongoose state. */
const getHealth = (_req, res) => {
  const readyState = mongoose.connection.readyState;
  res.set('Cache-Control', 'no-store');
  res.status(200).json({
    status: readyState === 1 ? 'ok' : 'degraded',
    uptime: Math.round(process.uptime()),
    db: DB_STATES[readyState] || 'unknown',
    timestamp: new Date().toISOString(),
  });
};

module.exports = { getHealth };

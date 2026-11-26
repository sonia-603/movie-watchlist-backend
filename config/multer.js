const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const { env } = require('./env');
const AppError = require('../utils/AppError');
const { ALLOWED_POSTER_TYPES } = require('../constants/watchlist');

// uploads/ is git-ignored, so create it on boot if it does not exist yet.
fs.mkdirSync(env.uploads.dir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, env.uploads.dir),
  // Never trust the client file name: build a unique one and take the
  // extension from the validated MIME type.
  filename: (_req, file, cb) => {
    const extension = ALLOWED_POSTER_TYPES[file.mimetype];
    cb(null, `${Date.now()}-${crypto.randomUUID()}${extension}`);
  },
});

const fileFilter = (_req, file, cb) => {
  if (ALLOWED_POSTER_TYPES[file.mimetype]) return cb(null, true);
  return cb(AppError.badRequest('Only JPEG, PNG or WEBP images are allowed'));
};

const posterUpload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: env.uploads.maxFileSize,
    files: 1,
    fields: 5,
  },
});

module.exports = posterUpload;

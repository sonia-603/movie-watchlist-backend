const fs = require('fs/promises');
const path = require('path');
const { env } = require('../config/env');
const logger = require('../utils/logger');

/**
 * Resolves a stored public path ("/uploads/abc.jpg") to a file inside the
 * uploads folder. Using path.basename blocks path-traversal attempts such as
 * "/uploads/../server.js".
 */
const resolveUploadPath = (publicPath) => {
  if (typeof publicPath !== 'string' || !publicPath.startsWith(`${env.uploads.publicPath}/`)) return null;
  const filename = path.basename(publicPath);
  if (!filename || filename.startsWith('.')) return null;
  return path.join(env.uploads.dir, filename);
};

/** Deletes a file by absolute path. Never throws: cleanup must not break the request. */
const deleteFileAtPath = async (absolutePath) => {
  if (!absolutePath) return;
  try {
    await fs.unlink(absolutePath);
  } catch (err) {
    if (err.code !== 'ENOENT') logger.warn(`Could not delete file ${absolutePath}: ${err.message}`);
  }
};

const deleteUploadedPoster = (publicPath) => deleteFileAtPath(resolveUploadPath(publicPath));

const toPublicPath = (filename) => `${env.uploads.publicPath}/${filename}`;

module.exports = { resolveUploadPath, deleteFileAtPath, deleteUploadedPoster, toPublicPath };

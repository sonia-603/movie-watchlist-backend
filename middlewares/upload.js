const posterUpload = require('../config/multer');
const AppError = require('../utils/AppError');
const { fileHasImageSignature } = require('../utils/fileSignature');
const { deleteFileAtPath } = require('../services/file.service');

const POSTER_FIELD = 'poster';

/** Accepts exactly one file in the "poster" field and requires it to be present. */
const receivePoster = (req, res, next) => {
  posterUpload.single(POSTER_FIELD)(req, res, (err) => {
    if (err) return next(err);
    if (!req.file) {
      return next(AppError.badRequest(`Please attach an image in the "${POSTER_FIELD}" field`));
    }
    return next();
  });
};

/** Confirms the saved file really is the image type it claims to be. */
const verifyPosterContent = async (req, _res, next) => {
  try {
    const valid = await fileHasImageSignature(req.file.path, req.file.mimetype);
    if (!valid) {
      await deleteFileAtPath(req.file.path);
      return next(AppError.badRequest('The uploaded file is not a valid JPEG, PNG or WEBP image'));
    }
    return next();
  } catch (err) {
    await deleteFileAtPath(req.file.path);
    return next(err);
  }
};

module.exports = { uploadPoster: [receivePoster, verifyPosterContent], POSTER_FIELD };

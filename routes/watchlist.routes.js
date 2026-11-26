const { Router } = require('express');
const controller = require('../controllers/watchlist.controller');
const validate = require('../middlewares/validate');
const validateObjectId = require('../middlewares/validateObjectId');
const { uploadPoster } = require('../middlewares/upload');
const {
  validateAddToWatchlist,
  validateUpdateItem,
  validateListQuery,
} = require('../validators/watchlist.validators');

const router = Router();

// Every route with :id gets its id checked before anything else runs (including multer).
router.param('id', validateObjectId);

router
  .route('/')
  .get(validate(validateListQuery, 'query'), controller.listItems)
  .post(validate(validateAddToWatchlist), controller.addItem);

router
  .route('/:id')
  .get(controller.getItem)
  .put(validate(validateUpdateItem), controller.updateItem)
  .delete(controller.deleteItem);

router
  .route('/:id/poster')
  .patch(uploadPoster, controller.uploadPoster)
  .delete(controller.resetPoster);

module.exports = router;

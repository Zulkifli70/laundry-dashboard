const express = require('express');
const router = express.Router();
const stokController = require('../controllers/stokController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', stokController.getStok);
router.post('/', authorize('admin'), stokController.createStok);
router.put('/:id', authorize('admin'), stokController.updateStok);
router.put('/:id/adjust', authorize('admin'), stokController.adjustStok);
router.delete('/:id', authorize('admin'), stokController.deleteStok);
router.get('/:id/log', authorize('admin'), stokController.getStokLog);

module.exports = router;

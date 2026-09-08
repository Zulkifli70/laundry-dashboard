const express = require('express');
const router = express.Router();
const outletController = require('../controllers/outletController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', authorize('admin'), outletController.getOutlets);
router.post('/', authorize('admin'), outletController.createOutlet);
router.put('/:id', authorize('admin'), outletController.updateOutlet);
router.delete('/:id', authorize('admin'), outletController.deleteOutlet);

module.exports = router;

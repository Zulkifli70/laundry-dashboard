const express = require('express');
const router = express.Router();
const layananController = require('../controllers/layananController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', layananController.getLayanan);
router.post('/', authorize('admin'), layananController.createLayanan);
router.put('/:id', authorize('admin'), layananController.updateLayanan);
router.delete('/:id', authorize('admin'), layananController.deleteLayanan);

module.exports = router;

const express = require('express');
const router = express.Router();
const pelangganController = require('../controllers/pelangganController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', pelangganController.getAll);
router.get('/:id', pelangganController.getById);
router.post('/', pelangganController.create);
router.put('/:id', pelangganController.update);
router.delete('/:id', authorize('admin'), pelangganController.delete);

module.exports = router;
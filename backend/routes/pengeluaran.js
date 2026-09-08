const express = require('express');
const router = express.Router();
const pengeluaranController = require('../controllers/pengeluaranController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/', authorize('admin'), pengeluaranController.getPengeluaran);
router.post('/', authorize('admin'), pengeluaranController.createPengeluaran);
router.put('/:id', authorize('admin'), pengeluaranController.updatePengeluaran);
router.delete('/:id', authorize('admin'), pengeluaranController.deletePengeluaran);

module.exports = router;

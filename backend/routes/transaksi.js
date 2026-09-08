const express = require('express');
const router = express.Router();
const transaksiController = require('../controllers/transaksiController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate);
router.get('/export', authorize('admin'), transaksiController.exportTransaksi);
router.get('/', transaksiController.getTransaksi);
router.get('/:id', transaksiController.getTransaksiById);
router.post('/', transaksiController.createTransaksi);
router.put('/:id', transaksiController.updateTransaksi);

module.exports = router;

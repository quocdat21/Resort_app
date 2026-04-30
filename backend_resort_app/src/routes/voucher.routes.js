const express = require('express');
const router = express.Router();
const voucherController = require('../controllers/voucher.controller');

// GET all vouchers
router.get('/', voucherController.getAllVouchers);

// POST validate voucher
router.post('/validate', voucherController.validateVoucher);

// GET single voucher
router.get('/:id', voucherController.getVoucherById);

// POST create voucher
router.post('/', voucherController.createVoucher);

// PUT update voucher
router.put('/:id', voucherController.updateVoucher);

// DELETE voucher
router.delete('/:id', voucherController.deleteVoucher);

module.exports = router;

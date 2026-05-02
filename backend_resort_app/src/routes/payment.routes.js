const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/payment.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

// --- User Routes ---
// Create a new booking and get payment info
router.post('/create', verifyToken, paymentController.createBookingAndPayment);
// Expire payment and cancel booking
router.post('/expire', verifyToken, paymentController.expirePayment);

// Check payment status
router.get('/status/:paymentId', verifyToken, paymentController.checkStatus);

// Get payment history
router.get('/history/:userId', verifyToken, paymentController.getPaymentHistory);

// --- Public Webhook ---
// SePay will call this endpoint
router.post('/webhook/sepay', paymentController.sepayWebhook);

// --- Admin Routes ---
router.get('/admin/all', verifyToken, requireRole('admin'), paymentController.getAllPayments);
router.put('/admin/update-status/:id', verifyToken, requireRole('admin'), paymentController.updatePaymentStatus);

module.exports = router;

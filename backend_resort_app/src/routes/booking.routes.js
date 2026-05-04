const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/booking.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.get('/user/:userId', verifyToken, bookingController.getUserBookings);
router.get('/detail/:bookingCode', verifyToken, bookingController.getBookingDetail);

// Admin routes
router.get('/admin/all', verifyToken, requireRole('admin'), bookingController.getAllBookings);
router.put('/admin/update-status/:id', verifyToken, requireRole('admin'), bookingController.updateBookingStatus);

module.exports = router;

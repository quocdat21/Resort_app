const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboard.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

router.get('/overview', verifyToken, requireRole('admin'), dashboardController.getOverview);

module.exports = router;

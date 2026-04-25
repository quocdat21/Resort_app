const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

// GET all users (Admin only)
router.get('/', verifyToken, requireRole('admin'), userController.getAllUsers);

module.exports = router;

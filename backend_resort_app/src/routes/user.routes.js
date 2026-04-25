const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const processImage = require('../middlewares/imageProcess.middleware');

// GET all users (Admin only)
router.get('/', verifyToken, requireRole('admin'), userController.getAllUsers);

// CREATE user (Admin only)
router.post('/', verifyToken, requireRole('admin'), upload.single('avatar'), processImage, userController.createUser);

// UPDATE user (Admin only)
router.put('/:id', verifyToken, requireRole('admin'), upload.single('avatar'), processImage, userController.updateUser);

module.exports = router;

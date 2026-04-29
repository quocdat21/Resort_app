const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
// const processImage = require('../middlewares/imageProcess.middleware');

// Public or User can see categories
router.get('/', categoryController.getAllCategories);

// Admin only operations
router.post('/', verifyToken, requireRole('admin'), upload.single('icon'), categoryController.createCategory);
router.put('/:id', verifyToken, requireRole('admin'), upload.single('icon'), categoryController.updateCategory);
router.delete('/:id', verifyToken, requireRole('admin'), categoryController.deleteCategory);

module.exports = router;

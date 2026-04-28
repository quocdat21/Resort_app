const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/service.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const processImage = require('../middlewares/imageProcess.middleware');

// Public or User routes
router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);

// Admin/Staff only routes
router.post('/', 
  verifyToken, 
  requireRole('admin'), 
  upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'secondary_images', maxCount: 5 }
  ]),
  processImage,
  serviceController.createService
);

router.put('/:id', 
  verifyToken, 
  requireRole('admin'), 
  upload.fields([
    { name: 'main_image', maxCount: 1 },
    { name: 'secondary_images', maxCount: 5 }
  ]),
  processImage,
  serviceController.updateService
);

router.delete('/:id', verifyToken, requireRole('admin'), serviceController.deleteService);

module.exports = router;

const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');
const upload = require('../middlewares/upload.middleware');
const processImage = require('../middlewares/imageProcess.middleware');

// --- ROOM TEMPLATES ---
router.get('/', roomController.getAllRooms);
router.get('/search', roomController.searchRooms);
router.get('/filter-meta', roomController.getFilterMeta);
router.get('/:id', roomController.getRoomById);
router.get('/:id/detail', roomController.getRoomDetail);

// Admin only
router.post('/', 
  verifyToken, 
  requireRole('admin'), 
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'secondaryImages', maxCount: 5 }
  ]), 
  processImage,
  roomController.createRoom
);

router.put('/:id', 
  verifyToken, 
  requireRole('admin'), 
  upload.fields([
    { name: 'mainImage', maxCount: 1 },
    { name: 'secondaryImages', maxCount: 5 }
  ]), 
  processImage,
  roomController.updateRoom
);

router.delete('/:id', verifyToken, requireRole('admin'), roomController.deleteRoom);

// --- ROOM INSTANCES (ROOM NUMBERS) ---
router.get('/:roomId/instances', roomController.getInstances);
router.post('/instances', verifyToken, requireRole('admin'), roomController.createInstance);
router.put('/instances/:id', verifyToken, requireRole('admin'), roomController.updateInstance);
router.delete('/instances/:id', verifyToken, requireRole('admin'), roomController.deleteInstance);

module.exports = router;

const express = require('express');
const router = express.Router();
const zoneController = require('../controllers/zone.controller');
const { verifyToken, requireRole } = require('../middlewares/auth.middleware');

// Public or User can see zones (optional, but Admin definitely)
router.get('/', zoneController.getAllZones);
router.get('/:id', zoneController.getZoneById);

// Admin only operations
router.post('/', verifyToken, requireRole('admin'), zoneController.createZone);
router.put('/:id', verifyToken, requireRole('admin'), zoneController.updateZone);
router.delete('/:id', verifyToken, requireRole('admin'), zoneController.deleteZone);

module.exports = router;

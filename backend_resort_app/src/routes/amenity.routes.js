const express = require('express');
const router = express.Router();
const amenityController = require('../controllers/amenity.controller');
const upload = require('../middlewares/upload.middleware');
// Note: We need a specific upload field for amenities if we want.
// For now, let's just use the single file upload from the middleware if it supports it.
// Actually, our middleware uses upload.fields or upload.single depending on usage.

router.get('/', amenityController.getAllAmenities);
router.get('/:id', amenityController.getAmenityById);
router.post('/', upload.single('icon'), amenityController.createAmenity);
router.put('/:id', upload.single('icon'), amenityController.updateAmenity);
router.delete('/:id', amenityController.deleteAmenity);

module.exports = router;

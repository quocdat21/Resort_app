const express = require('express');
const router = express.Router();
const amenityController = require('../controllers/amenity.controller');
const upload = require('../middlewares/upload.middleware');
const processImage = require('../middlewares/imageProcess.middleware');

router.get('/', amenityController.getAllAmenities);
router.get('/:id', amenityController.getAmenityById);
router.post('/', upload.single('icon'), processImage, amenityController.createAmenity);
router.put('/:id', upload.single('icon'), processImage, amenityController.updateAmenity);
router.delete('/:id', amenityController.deleteAmenity);

module.exports = router;

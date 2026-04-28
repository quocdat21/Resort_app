const express = require('express');
const router = express.Router();
const homeController = require('../controllers/home.controller');

// Public endpoint - no auth required for the mobile app home screen
router.get('/', homeController.getHomeData);

module.exports = router;

// File: src/routes/location.routes.js
const express = require('express');
const router = express.Router();
const locationController = require('../controllers/location.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Protected routes
router.post('/', authenticate, locationController.saveLocation);

module.exports = router;
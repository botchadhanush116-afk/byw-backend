// File: src/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const constants = require('../utils/constants');

// Protected routes
router.get('/me', authenticate, userController.getProfile);
router.get('/workers', authenticate, authorize(constants.USER_ROLES.CUSTOMER), userController.getWorkers);

module.exports = router;
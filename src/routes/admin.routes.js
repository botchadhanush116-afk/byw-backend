// File: src/routes/admin.routes.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const constants = require('../utils/constants');

// Admin only routes
router.get('/reports', authenticate, authorize(constants.USER_ROLES.ADMIN), adminController.getReports);

module.exports = router;
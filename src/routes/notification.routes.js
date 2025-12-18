// File: src/routes/notification.routes.js
const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notification.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Protected routes
router.get('/', authenticate, notificationController.getNotifications);
router.patch('/:id/read', authenticate, notificationController.markAsRead);
router.delete('/clear', authenticate, notificationController.clearNotifications);

module.exports = router;
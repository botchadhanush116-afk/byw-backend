// File: src/routes/chat.routes.js
const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chat.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { schemas } = require('../middlewares/validate.middleware');

// Protected routes
router.post('/', authenticate, validate(schemas.createChat), chatController.createOrGetChat);
router.get('/', authenticate, chatController.getChats);

module.exports = router;
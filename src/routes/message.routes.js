// File: src/routes/message.routes.js
const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { schemas } = require('../middlewares/validate.middleware');

// Protected routes
router.post('/', authenticate, validate(schemas.sendMessage), messageController.sendMessage);
router.get('/:chatId', authenticate, messageController.getMessages);

module.exports = router;
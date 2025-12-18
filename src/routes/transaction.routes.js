// File: src/routes/transaction.routes.js
const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transaction.controller');
const { authenticate } = require('../middlewares/auth.middleware');

// Protected routes
router.get('/', authenticate, transactionController.getTransactionHistory);

module.exports = router;
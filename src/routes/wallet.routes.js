// File: src/routes/wallet.routes.js
const express = require('express');
const router = express.Router();
const walletController = require('../controllers/wallet.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { schemas } = require('../middlewares/validate.middleware');
const constants = require('../utils/constants');

// Protected routes
router.get('/', authenticate, walletController.getWallet);
router.get('/history', authenticate, walletController.getWalletHistory);

// Customer only
router.post('/add', authenticate, authorize(constants.USER_ROLES.CUSTOMER), validate(schemas.addMoney), walletController.addMoney);

// Worker only
router.post('/withdraw', authenticate, authorize(constants.USER_ROLES.WORKER), validate(schemas.withdrawMoney), walletController.withdrawMoney);

module.exports = router;
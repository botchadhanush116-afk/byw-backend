// File: src/routes/bid.routes.js
const express = require('express');
const router = express.Router();
const bidController = require('../controllers/bid.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { schemas } = require('../middlewares/validate.middleware');
const constants = require('../utils/constants');

// Worker routes
router.post('/', authenticate, authorize(constants.USER_ROLES.WORKER), validate(schemas.placeBid), bidController.placeBid);

// Customer routes
router.get('/job/:jobId', authenticate, authorize(constants.USER_ROLES.CUSTOMER), bidController.getJobBids);

module.exports = router;
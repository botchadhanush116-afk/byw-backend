// File: src/routes/rating.routes.js
const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/rating.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { schemas } = require('../middlewares/validate.middleware');
const constants = require('../utils/constants');

// Customer routes
router.post('/', authenticate, authorize(constants.USER_ROLES.CUSTOMER), validate(schemas.submitRating), ratingController.submitRating);
router.get('/worker/:workerId', authenticate, ratingController.getWorkerRatings);

module.exports = router;
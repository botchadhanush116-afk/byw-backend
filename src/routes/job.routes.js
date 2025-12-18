// File: src/routes/job.routes.js
const express = require('express');
const router = express.Router();
const jobController = require('../controllers/job.controller');
const { authenticate } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const { validate, schemas } = require('../middlewares/validate.middleware');
const constants = require('../utils/constants');

// Customer routes
router.post('/', authenticate, authorize(constants.USER_ROLES.CUSTOMER), validate(schemas.createJob), jobController.createJob);
router.get('/my', authenticate, authorize(constants.USER_ROLES.CUSTOMER), jobController.getMyJobs);
router.patch('/:id/cancel', authenticate, authorize(constants.USER_ROLES.CUSTOMER), jobController.cancelJob);
router.patch('/:id/extend', authenticate, authorize(constants.USER_ROLES.CUSTOMER), jobController.extendJobTime);
router.patch('/:id/assign', authenticate, authorize(constants.USER_ROLES.CUSTOMER), validate(schemas.assignWorker), jobController.assignWorker);
router.patch('/:id/confirm-completion', authenticate, authorize(constants.USER_ROLES.CUSTOMER), jobController.confirmCompletion);

// Worker routes
router.get('/', authenticate, authorize(constants.USER_ROLES.WORKER), jobController.getAvailableJobs);
router.patch('/:id/complete-request', authenticate, authorize(constants.USER_ROLES.WORKER), jobController.markJobCompleted);

// Common routes
router.get('/:id', authenticate, jobController.getJob);

module.exports = router;
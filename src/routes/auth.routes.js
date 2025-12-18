// File: src/routes/auth.routes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { validate, schemas } = require('../middlewares/validate.middleware');
const { authenticate } = require('../middlewares/auth.middleware');

// Public routes
router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);
router.post('/forgot-password', validate(schemas.forgotPassword), authController.forgotPassword);
router.post('/verify-otp', validate(schemas.verifyOtp), authController.verifyOtp);
router.post('/reset-password', validate(schemas.resetPassword), authController.resetPassword);
router.post('/check-email', authController.checkEmail);

// Protected routes
router.post('/select-role', authenticate, validate(schemas.selectRole), authController.selectRole);

module.exports = router;
// File: src/controllers/auth.controller.js
const authService = require('../services/auth.service');
const response = require('../utils/response');

const register = async (req, res, next) => {
    try {
        const result = await authService.registerUser(req.body);
        return response.success(res, 'Registration successful', result);
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const result = await authService.loginUser(req.body);
        return response.success(res, 'Login successful', result);
    } catch (error) {
        next(error);
    }
};

const selectRole = async (req, res, next) => {
    try {
        const result = await authService.selectUserRole(req.user._id, req.body.role);
        return response.success(res, 'Role selected successfully', result);
    } catch (error) {
        next(error);
    }
};

const forgotPassword = async (req, res, next) => {
    try {
        await authService.sendPasswordResetOtp(req.body.email);
        return response.success(res, 'OTP sent to email');
    } catch (error) {
        next(error);
    }
};

const verifyOtp = async (req, res, next) => {
    try {
        const result = await authService.verifyPasswordResetOtp(req.body.email, req.body.otp);
        return response.success(res, 'OTP verified successfully', result);
    } catch (error) {
        next(error);
    }
};

const resetPassword = async (req, res, next) => {
    try {
        await authService.resetPassword(req.body.email, req.body.newPassword);
        return response.success(res, 'Password reset successfully');
    } catch (error) {
        next(error);
    }
};

const checkEmail = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            return response.badRequest(res, 'Email is required');
        }

        const exists = await authService.checkEmailExists(email);

        if (exists) {
            return response.conflict(res, 'Email already registered');
        }

        return response.success(res, 'Email is available');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    register,
    login,
    selectRole,
    forgotPassword,
    verifyOtp,
    resetPassword,
    checkEmail
};
// File: src/services/auth.service.js
const User = require('../models/user.model');
const Wallet = require('../models/wallet.model');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateAuthToken } = require('../utils/jwt');
const otpService = require('./otp.service');
const constants = require('../utils/constants');
const logger = require('../config/logger');

const registerUser = async (userData) => {
    const { email, password, workTypes = [] } = userData;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
        throw new Error('Email already registered');
    }

    // Validate VITAP email
    const vitapPatterns = [
        /^[a-zA-Z]+\.[a-zA-Z0-9]+@vitapstudent\.ac\.in$/,
        /^[a-zA-Z]+@vitap\.ac\.in$/
    ];

    if (!vitapPatterns.some(pattern => pattern.test(email))) {
        throw new Error('Please use a valid VITAP email address');
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Determine roles based on workTypes
    const roles = [constants.USER_ROLES.CUSTOMER];
    if (workTypes.length > 0) {
        roles.push(constants.USER_ROLES.WORKER);
    }

    // Create user
    const user = new User({
        ...userData,
        password: hashedPassword,
        roles,
        activeRole: roles[0]
    });

    await user.save();

    // Create wallet for user
    const wallet = new Wallet({
        userId: user._id,
        balance: 0
    });

    await wallet.save();

    // Generate JWT token
    const token = generateAuthToken(user);

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            roles: user.roles,
            activeRole: user.activeRole
        }
    };
};

const loginUser = async ({ email, password }) => {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Invalid credentials');
    }

    // Check if user is active
    if (!user.isActive) {
        throw new Error('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    // Generate JWT token
    const token = generateAuthToken(user);

    return {
        token,
        user: {
            id: user._id,
            name: user.name,
            email: user.email,
            roles: user.roles,
            activeRole: user.activeRole || user.roles[0],
            workTypes: user.workTypes
        }
    };
};

const selectUserRole = async (userId, role) => {
    const user = await User.findById(userId);

    if (!user) {
        throw new Error('User not found');
    }

    // Check if user has the selected role
    if (!user.roles.includes(role)) {
        throw new Error('User does not have this role');
    }

    // Update active role
    user.activeRole = role;
    await user.save();

    // Generate new token with updated role
    const token = generateAuthToken(user);

    return {
        token,
        activeRole: role
    };
};

const sendPasswordResetOtp = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        // Don't reveal that user doesn't exist for security
        logger.info(`Password reset requested for non-existent email: ${email}`);
        return;
    }

    // Generate and save OTP
    const otp = await otpService.generateAndSaveOtp(user._id);

    // In production, send OTP via email/SMS
    logger.info(`Password reset OTP for ${email}: ${otp}`);

    // For demo purposes, we'll just log it
    console.log(`OTP for ${email}: ${otp}`);
};

const verifyPasswordResetOtp = async (email, otp) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Invalid OTP');
    }

    const isValid = await otpService.verifyOtp(user._id, otp);
    if (!isValid) {
        throw new Error('Invalid or expired OTP');
    }

    // Generate temporary token for password reset
    const token = generateAuthToken(user);

    return { token };
};

const resetPassword = async (email, newPassword) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }

    // Hash new password
    user.password = await hashPassword(newPassword);

    // Clear OTP
    user.otp = undefined;

    await user.save();

    logger.info(`Password reset for user: ${email}`);
};

const checkEmailExists = async (email) => {
    const user = await User.findOne({ email });
    return !!user;
};

module.exports = {
    registerUser,
    loginUser,
    selectUserRole,
    sendPasswordResetOtp,
    verifyPasswordResetOtp,
    resetPassword,
    checkEmailExists
};
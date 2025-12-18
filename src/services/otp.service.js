// File: src/services/otp.service.js
const crypto = require('crypto');
const User = require('../models/user.model');
const timeUtils = require('../utils/time');
const env = require('../config/env');

const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};

const generateAndSaveOtp = async (userId) => {
    const otp = generateOtp();
    const expiresAt = timeUtils.generateOtpExpiry(env.OTP_EXPIRE / 60); // Convert seconds to minutes

    await User.findByIdAndUpdate(userId, {
        otp: {
            code: otp,
            expiresAt
        }
    });

    return otp;
};

const verifyOtp = async (userId, otp) => {
    const user = await User.findById(userId);

    if (!user || !user.otp || !user.otp.code || !user.otp.expiresAt) {
        return false;
    }

    // Check if OTP matches
    if (user.otp.code !== otp) {
        return false;
    }

    // Check if OTP is expired
    if (new Date() > user.otp.expiresAt) {
        // Clear expired OTP
        user.otp = undefined;
        await user.save();
        return false;
    }

    // Clear OTP after successful verification
    user.otp = undefined;
    await user.save();

    return true;
};

module.exports = {
    generateOtp,
    generateAndSaveOtp,
    verifyOtp
};
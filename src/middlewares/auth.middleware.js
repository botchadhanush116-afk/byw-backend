// File: src/middlewares/auth.middleware.js
const jwtUtils = require('../utils/jwt');
const response = require('../utils/response');
const User = require('../models/user.model');

const authenticate = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return response.unauthorized(res, 'Authentication required');
        }

        const decoded = jwtUtils.verifyToken(token);

        const user = await User.findById(decoded.userId).select('-password');
        if (!user) {
            return response.unauthorized(res, 'User not found');
        }

        // Check if user is active
        if (!user.isActive) {
            return response.unauthorized(res, 'Account is deactivated');
        }

        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        return response.unauthorized(res, 'Invalid or expired token');
    }
};

module.exports = { authenticate };
// File: src/middlewares/error.middleware.js
const logger = require('../config/logger');
const response = require('../utils/response');

const errorHandler = (err, req, res, next) => {
    logger.error(`Error: ${err.message}`, { stack: err.stack, path: req.path });

    // Joi validation error
    if (err.isJoi) {
        return response.badRequest(res, err.details[0].message);
    }

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        const errors = Object.values(err.errors).map(e => e.message);
        return response.badRequest(res, errors.join(', '));
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        return response.conflict(res, `${field} already exists`);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return response.unauthorized(res, 'Invalid token');
    }

    if (err.name === 'TokenExpiredError') {
        return response.unauthorized(res, 'Token expired');
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    return response.error(res, message, statusCode);
};

module.exports = errorHandler;
// File: src/utils/response.js
const StatusCodes = require('http-status-codes').StatusCodes;

const success = (res, message, data = null, statusCode = StatusCodes.OK) => {
    const response = {
        success: true,
        message
    };

    if (data !== null) {
        response.data = data;
    }

    return res.status(statusCode).json(response);
};

const error = (res, message, statusCode = StatusCodes.INTERNAL_SERVER_ERROR) => {
    return res.status(statusCode).json({
        success: false,
        message
    });
};

const badRequest = (res, message) => {
    return error(res, message, StatusCodes.BAD_REQUEST);
};

const unauthorized = (res, message) => {
    return error(res, message, StatusCodes.UNAUTHORIZED);
};

const forbidden = (res, message) => {
    return error(res, message, StatusCodes.FORBIDDEN);
};

const notFound = (res, message) => {
    return error(res, message, StatusCodes.NOT_FOUND);
};

const conflict = (res, message) => {
    return error(res, message, StatusCodes.CONFLICT);
};

module.exports = {
    success,
    error,
    badRequest,
    unauthorized,
    forbidden,
    notFound,
    conflict
};
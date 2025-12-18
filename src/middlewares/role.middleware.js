// File: src/middlewares/role.middleware.js
const response = require('../utils/response');

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return response.unauthorized(res, 'Authentication required');
        }

        const userRole = req.user.activeRole || req.user.roles[0];

        if (!roles.includes(userRole)) {
            return response.forbidden(res, `Access denied. Required roles: ${roles.join(', ')}`);
        }

        next();
    };
};

module.exports = { authorize };
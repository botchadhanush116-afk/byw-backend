// File: src/utils/jwt.js
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const generateToken = (payload, expiresIn = env.JWT_EXPIRE) => {
    return jwt.sign(payload, env.JWT_SECRET, { expiresIn });
};

const verifyToken = (token) => {
    return jwt.verify(token, env.JWT_SECRET);
};

const generateAuthToken = (user) => {
    const payload = {
        userId: user._id,
        email: user.email,
        role: user.activeRole || user.roles[0],
        roles: user.roles
    };

    return generateToken(payload);
};

module.exports = {
    generateToken,
    verifyToken,
    generateAuthToken
};
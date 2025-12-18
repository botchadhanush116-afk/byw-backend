// File: src/config/env.js
require('dotenv').config();

const env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 5000,
    MONGODB_URI: process.env.MONGODB_URI,
    JWT_SECRET: process.env.JWT_SECRET,
    JWT_EXPIRE: process.env.JWT_EXPIRE || '7d',
    OTP_EXPIRE: process.env.OTP_EXPIRE || 300,
    FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};

// Validate required environment variables
const requiredEnvVars = ['MONGODB_URI', 'JWT_SECRET'];
requiredEnvVars.forEach((key) => {
    if (!env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
});

module.exports = env;
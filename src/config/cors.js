// File: src/config/cors.js
const env = require('./env');

const corsOptions = {
    origin: (origin, callback) => {
        const allowedOrigins = [
            env.FRONTEND_URL,
            'http://localhost:3000',
            'https://localhost:3000'
        ];

        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Range', 'X-Content-Range'],
    maxAge: 86400, // 24 hours
};

module.exports = corsOptions;
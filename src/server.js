// File: src/server.js
const app = require('./app');
const { connectDB } = require('./config/db');
const { initializeSocket } = require('./config/socket');
const logger = require('./config/logger');
const env = require('./config/env');

const PORT = env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Create HTTP server
const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${env.NODE_ENV} mode`);
});

// Initialize Socket.io
initializeSocket(server);

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error('Unhandled Promise Rejection:', err);
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception:', err);
    process.exit(1);
});

module.exports = server;
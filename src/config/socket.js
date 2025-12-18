// File: src/config/socket.js
const socketIO = require('socket.io');
const jwtUtils = require('../utils/jwt');
const logger = require('./logger');

let io;

const initializeSocket = (server) => {
    io = socketIO(server, {
        cors: {
            origin: process.env.FRONTEND_URL || 'http://localhost:3000',
            methods: ['GET', 'POST'],
            credentials: true,
        },
        pingTimeout: 60000,
    });

    // Socket middleware for authentication
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication error: No token provided'));
        }

        try {
            const decoded = jwtUtils.verifyToken(token);
            socket.userId = decoded.userId;
            socket.role = decoded.role;
            next();
        } catch (error) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        logger.info(`Socket connected: ${socket.id} - User: ${socket.userId}`);

        // Join user-specific room
        socket.join(`user_${socket.userId}`);

        // Handle disconnection
        socket.on('disconnect', () => {
            logger.info(`Socket disconnected: ${socket.id}`);
        });

        // Join chat room
        socket.on('join_chat', (chatId) => {
            socket.join(`chat_${chatId}`);
        });

        // Leave chat room
        socket.on('leave_chat', (chatId) => {
            socket.leave(`chat_${chatId}`);
        });
    });

    return io;
};

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

module.exports = { initializeSocket, getIO };
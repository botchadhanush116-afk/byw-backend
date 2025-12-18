// File: src/sockets/notification.socket.js
const { getIO } = require('../config/socket');

const initializeNotificationSocket = () => {
    const io = getIO();

    io.on('connection', (socket) => {
        // User can request notification count
        socket.on('get_notification_count', async () => {
            // In a real app, fetch from database
            // For now, emit a mock count
            socket.emit('notification_count', { count: 0 });
        });
    });
};

module.exports = { initializeNotificationSocket };
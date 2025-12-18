// File: src/sockets/chat.socket.js
const { getIO } = require('../config/socket');

const initializeChatSocket = () => {
    const io = getIO();

    io.on('connection', (socket) => {
        // Join chat room
        socket.on('join_chat', (chatId) => {
            socket.join(`chat_${chatId}`);
        });

        // Leave chat room
        socket.on('leave_chat', (chatId) => {
            socket.leave(`chat_${chatId}`);
        });

        // Typing indicator
        socket.on('typing', (data) => {
            const { chatId, isTyping } = data;
            socket.to(`chat_${chatId}`).emit('user_typing', {
                userId: socket.userId,
                isTyping
            });
        });
    });
};

module.exports = { initializeChatSocket };
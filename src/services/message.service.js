// File: src/services/message.service.js
const Message = require('../models/message.model');
const Chat = require('../models/chat.model');
const chatService = require('./chat.service');
const { getIO } = require('../config/socket');
const constants = require('../utils/constants');

const sendMessage = async (messageData) => {
    const { chatId, senderId, senderName, text } = messageData;

    // Verify chat exists and sender is participant
    const chat = await Chat.findById(chatId);

    if (!chat) {
        throw new Error('Chat not found');
    }

    const isCustomer = chat.customerId.toString() === senderId.toString();
    const isWorker = chat.workerId.toString() === senderId.toString();

    if (!isCustomer && !isWorker) {
        throw new Error('Unauthorized to send message in this chat');
    }

    // Create message
    const message = new Message({
        chatId,
        senderId,
        senderName,
        text,
        read: false
    });

    await message.save();

    // Update chat last message
    await chatService.updateChatLastMessage(chatId, message);

    // Determine recipient
    const recipientId = isCustomer ? chat.workerId : chat.customerId;
    const recipientRole = isCustomer ? constants.USER_ROLES.WORKER : constants.USER_ROLES.CUSTOMER;

    // Increment unread count for recipient
    await chatService.incrementUnreadCount(chatId, recipientRole);

    // Emit socket event
    const io = getIO();
    io.to(`chat_${chatId}`).emit('new_message', {
        message: {
            id: message._id,
            chatId: message.chatId,
            senderId: message.senderId,
            senderName: message.senderName,
            text: message.text,
            timestamp: message.createdAt
        }
    });

    // Notify recipient if not in chat room
    io.to(`user_${recipientId}`).emit('chat_notification', {
        chatId,
        message: `New message from ${senderName}`,
        senderName,
        text: text.length > 50 ? text.substring(0, 50) + '...' : text
    });

    return message;
};

const getChatMessages = async (chatId, userId) => {
    // Verify chat exists and user is participant
    const chat = await Chat.findById(chatId);

    if (!chat) {
        throw new Error('Chat not found');
    }

    const isCustomer = chat.customerId.toString() === userId.toString();
    const isWorker = chat.workerId.toString() === userId.toString();

    if (!isCustomer && !isWorker) {
        throw new Error('Unauthorized to view messages in this chat');
    }

    // Get messages
    const messages = await Message.find({ chatId })
        .sort({ createdAt: 1 })
        .limit(100);

    // Mark messages as read and reset unread count
    const unreadMessages = messages.filter(msg =>
        !msg.read && msg.senderId.toString() !== userId.toString()
    );

    if (unreadMessages.length > 0) {
        const messageIds = unreadMessages.map(msg => msg._id);
        await Message.updateMany(
            { _id: { $in: messageIds } },
            { read: true }
        );

        // Reset unread count for this user
        const userRole = isCustomer ? constants.USER_ROLES.CUSTOMER : constants.USER_ROLES.WORKER;
        await chatService.resetUnreadCount(chatId, userRole);
    }

    return messages;
};

module.exports = {
    sendMessage,
    getChatMessages
};
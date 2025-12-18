// File: src/controllers/message.controller.js
const messageService = require('../services/message.service');
const response = require('../utils/response');

const sendMessage = async (req, res, next) => {
    try {
        const message = await messageService.sendMessage({
            ...req.body,
            senderId: req.user._id,
            senderName: req.user.name
        });

        return response.success(res, 'Message sent successfully', { message });
    } catch (error) {
        next(error);
    }
};

const getMessages = async (req, res, next) => {
    try {
        const messages = await messageService.getChatMessages(req.params.chatId, req.user._id);
        return response.success(res, 'Messages retrieved successfully', { messages });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    sendMessage,
    getMessages
};
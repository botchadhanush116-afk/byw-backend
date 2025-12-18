// File: src/controllers/chat.controller.js
const chatService = require('../services/chat.service');
const response = require('../utils/response');

const createOrGetChat = async (req, res, next) => {
    try {
        const chat = await chatService.createOrGetChat(req.body.jobId, req.user);
        return response.success(res, 'Chat retrieved successfully', { chat });
    } catch (error) {
        next(error);
    }
};

const getChats = async (req, res, next) => {
    try {
        const chats = await chatService.getUserChats(req.user._id, req.user.activeRole || req.user.roles[0]);
        return response.success(res, 'Chats retrieved successfully', { chats });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createOrGetChat,
    getChats
};
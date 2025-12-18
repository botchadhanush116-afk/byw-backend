// File: src/controllers/notification.controller.js
const notificationService = require('../services/notification.service');
const response = require('../utils/response');

const getNotifications = async (req, res, next) => {
    try {
        const notifications = await notificationService.getUserNotifications(req.user._id);
        return response.success(res, 'Notifications retrieved successfully', { notifications });
    } catch (error) {
        next(error);
    }
};

const markAsRead = async (req, res, next) => {
    try {
        await notificationService.markNotificationAsRead(req.params.id, req.user._id);
        return response.success(res, 'Notification marked as read');
    } catch (error) {
        next(error);
    }
};

const clearNotifications = async (req, res, next) => {
    try {
        await notificationService.clearAllNotifications(req.user._id);
        return response.success(res, 'All notifications cleared');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getNotifications,
    markAsRead,
    clearNotifications
};
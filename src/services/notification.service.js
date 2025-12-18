// File: src/services/notification.service.js
const Notification = require('../models/notification.model');
const { getIO } = require('../config/socket');

const createNotification = async (notificationData) => {
    const notification = new Notification(notificationData);
    await notification.save();

    // Emit socket event
    const io = getIO();
    io.to(`user_${notification.userId}`).emit('new_notification', {
        notification: {
            id: notification._id,
            type: notification.type,
            message: notification.message,
            read: notification.read,
            relatedId: notification.relatedId,
            actions: notification.actions,
            timestamp: notification.createdAt
        }
    });

    return notification;
};

const getUserNotifications = async (userId) => {
    const notifications = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50);

    return notifications;
};

const markNotificationAsRead = async (notificationId, userId) => {
    const notification = await Notification.findOne({
        _id: notificationId,
        userId
    });

    if (!notification) {
        throw new Error('Notification not found or unauthorized');
    }

    notification.read = true;
    await notification.save();

    return notification;
};

const clearAllNotifications = async (userId) => {
    await Notification.deleteMany({ userId, read: true });
};

module.exports = {
    createNotification,
    getUserNotifications,
    markNotificationAsRead,
    clearAllNotifications
};
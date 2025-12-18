// File: src/models/notification.model.js
const mongoose = require('mongoose');
const constants = require('../utils/constants');

const notificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: Object.values(constants.NOTIFICATION_TYPES),
        required: true
    },
    message: {
        type: String,
        required: true
    },
    read: {
        type: Boolean,
        default: false
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId
    },
    actions: {
        accept: Boolean,
        reject: Boolean,
        extend: Boolean
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes
notificationSchema.index({ userId: 1, read: 1, createdAt: -1 });
notificationSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 }); // Auto-delete after 30 days

const Notification = mongoose.model('Notification', notificationSchema);

module.exports = Notification;
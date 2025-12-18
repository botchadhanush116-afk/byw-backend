// File: src/models/chat.model.js
const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true,
        unique: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    customerName: {
        type: String,
        required: true
    },
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    workerName: {
        type: String,
        required: true
    },
    jobTitle: {
        type: String,
        required: true
    },
    lastMessage: {
        text: String,
        senderId: mongoose.Schema.Types.ObjectId,
        timestamp: Date
    },
    unreadCountCustomer: {
        type: Number,
        default: 0
    },
    unreadCountWorker: {
        type: Number,
        default: 0
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Indexes
chatSchema.index({ customerId: 1, updatedAt: -1 });
chatSchema.index({ workerId: 1, updatedAt: -1 });
chatSchema.index({ jobId: 1 });

const Chat = mongoose.model('Chat', chatSchema);

module.exports = Chat;
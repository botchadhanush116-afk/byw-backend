// File: src/models/message.model.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true
    },
    senderId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    senderName: {
        type: String,
        required: true
    },
    text: {
        type: String,
        required: true,
        trim: true
    },
    read: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes for efficient querying
messageSchema.index({ chatId: 1, createdAt: 1 });
messageSchema.index({ senderId: 1 });
messageSchema.index({ chatId: 1, read: 1 });

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;
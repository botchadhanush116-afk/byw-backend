// File: src/models/transaction.model.js
const mongoose = require('mongoose');
const constants = require('../utils/constants');

const transactionSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: Object.values(constants.TRANSACTION_TYPES),
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(constants.TRANSACTION_STATUS),
        default: constants.TRANSACTION_STATUS.COMPLETED
    },
    referenceId: {
        type: String
    },
    details: {
        type: mongoose.Schema.Types.Mixed
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes
transactionSchema.index({ userId: 1, createdAt: -1 });
transactionSchema.index({ referenceId: 1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
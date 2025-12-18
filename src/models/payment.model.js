// File: src/models/payment.model.js
const mongoose = require('mongoose');
const constants = require('../utils/constants');

const paymentSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
        required: true
    },
    customerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    amount: {
        type: Number,
        required: true,
        min: 0
    },
    method: {
        type: String,
        enum: Object.values(constants.PAYMENT_METHODS),
        required: true
    },
    reference: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(constants.TRANSACTION_STATUS),
        default: constants.TRANSACTION_STATUS.PENDING
    },
    processedAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes
paymentSchema.index({ jobId: 1 }, { unique: true });
paymentSchema.index({ customerId: 1 });
paymentSchema.index({ workerId: 1 });
paymentSchema.index({ status: 1 });

const Payment = mongoose.model('Payment', paymentSchema);

module.exports = Payment;
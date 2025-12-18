// File: src/models/bid.model.js
const mongoose = require('mongoose');

const bidSchema = new mongoose.Schema({
    jobId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Job',
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
    amount: {
        type: Number,
        required: true,
        min: 1
    },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Compound index to prevent duplicate bids
bidSchema.index({ jobId: 1, workerId: 1 }, { unique: true });

// Index for faster queries
bidSchema.index({ jobId: 1, status: 1 });
bidSchema.index({ workerId: 1 });

const Bid = mongoose.model('Bid', bidSchema);

module.exports = Bid;
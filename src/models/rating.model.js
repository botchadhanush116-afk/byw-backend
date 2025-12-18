// File: src/models/rating.model.js
const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
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
    workerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    review: {
        type: String,
        trim: true,
        maxlength: 500
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Indexes
ratingSchema.index({ workerId: 1, createdAt: -1 });
ratingSchema.index({ jobId: 1 });
ratingSchema.index({ customerId: 1, workerId: 1 });

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
// File: src/models/job.model.js
const mongoose = require('mongoose');
const constants = require('../utils/constants');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
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
    customerPhone: {
        type: String
    },
    budget: {
        type: Number,
        required: true,
        min: 1
    },
    workType: {
        type: String,
        enum: Object.values(constants.WORK_TYPES),
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: Object.values(constants.JOB_STATUS),
        default: constants.JOB_STATUS.OPEN
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    assignedToName: {
        type: String
    },
    assignedToPhone: {
        type: String
    },
    timeLimit: {
        enabled: {
            type: Boolean,
            default: false
        },
        milliseconds: {
            type: Number,
            default: 0
        },
        expiryTime: {
            type: Date
        }
    },
    completedDate: {
        type: Date
    },
    paid: {
        type: Boolean,
        default: false
    },
    rated: {
        type: Boolean,
        default: false
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
        },
        coordinates: {
            type: [Number],
            default: [0, 0]
        }
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
jobSchema.index({ customerId: 1, status: 1 });
jobSchema.index({ assignedTo: 1, status: 1 });
jobSchema.index({ workType: 1, status: 1 });
jobSchema.index({ location: '2dsphere' });
jobSchema.index({ 'timeLimit.expiryTime': 1 }, { expireAfterSeconds: 0 }); // TTL index for auto-expiry

// Virtual for bids
jobSchema.virtual('bids', {
    ref: 'Bid',
    localField: '_id',
    foreignField: 'jobId'
});

// Pre-save hook to set expiry time
jobSchema.pre('save', function (next) {
    if (this.timeLimit.enabled && this.timeLimit.milliseconds > 0) {
        this.timeLimit.expiryTime = new Date(Date.now() + this.timeLimit.milliseconds);
    }
    next();
});

const Job = mongoose.model('Job', jobSchema);

module.exports = Job;
// File: src/models/user.model.js
const mongoose = require('mongoose');
const constants = require('../utils/constants');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true
    },
    dob: {
        type: Date,
        required: true
    },
    mobile: {
        type: String,
        required: true,
        unique: true,
        match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number']
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        match: [
            /^[a-zA-Z]+\.[a-zA-Z0-9]+@vitapstudent\.ac\.in$|^[a-zA-Z]+@vitap\.ac\.in$/,
            'Please use a valid VITAP email address'
        ]
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    roles: {
        type: [String],
        enum: Object.values(constants.USER_ROLES),
        default: [constants.USER_ROLES.CUSTOMER]
    },
    activeRole: {
        type: String,
        enum: Object.values(constants.USER_ROLES)
    },
    workTypes: {
        type: [String],
        enum: Object.values(constants.WORK_TYPES),
        default: []
    },
    isActive: {
        type: Boolean,
        default: true
    },
    averageRating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    totalRatings: {
        type: Number,
        default: 0
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
    otp: {
        code: String,
        expiresAt: Date
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

// Index for geospatial queries
userSchema.index({ location: '2dsphere' });

// Index for search
userSchema.index({ name: 'text', email: 'text' });

// Method to check if user is worker
userSchema.methods.isWorker = function () {
    return this.roles.includes(constants.USER_ROLES.WORKER);
};

// Method to check if user is customer
userSchema.methods.isCustomer = function () {
    return this.roles.includes(constants.USER_ROLES.CUSTOMER);
};

// Method to check if user can do work type
userSchema.methods.canDoWorkType = function (workType) {
    return this.workTypes.includes(workType);
};

const User = mongoose.model('User', userSchema);

module.exports = User;
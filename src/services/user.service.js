// File: src/services/user.service.js
const User = require('../models/user.model');
const constants = require('../utils/constants');

const getUserProfile = async (userId) => {
    const user = await User.findById(userId).select('-password -otp');

    if (!user) {
        throw new Error('User not found');
    }

    return {
        id: user._id,
        name: user.name,
        gender: user.gender,
        dob: user.dob,
        mobile: user.mobile,
        email: user.email,
        roles: user.roles,
        activeRole: user.activeRole,
        workTypes: user.workTypes,
        averageRating: user.averageRating,
        createdAt: user.createdAt
    };
};

const getWorkersList = async (filters = {}) => {
    const { search, type, ratingMin, experienceMin } = filters;

    const query = {
        roles: constants.USER_ROLES.WORKER,
        isActive: true
    };

    // Search filter
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: 'i' } },
            { email: { $regex: search, $options: 'i' } }
        ];
    }

    // Work type filter
    if (type) {
        if (type === 'both') {
            query.workTypes = { $all: [constants.WORK_TYPES.ACADEMIC, constants.WORK_TYPES.GENERAL] };
        } else {
            query.workTypes = type;
        }
    }

    // Rating filter
    if (ratingMin) {
        query.averageRating = { $gte: ratingMin };
    }

    // Note: Experience filter would require adding experience field to User model

    const workers = await User.find(query)
        .select('name email workTypes averageRating')
        .sort({ averageRating: -1, name: 1 });

    return workers;
};

module.exports = {
    getUserProfile,
    getWorkersList
};
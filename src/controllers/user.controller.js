// File: src/controllers/user.controller.js
const userService = require('../services/user.service');
const response = require('../utils/response');

const getProfile = async (req, res, next) => {
    try {
        const profile = await userService.getUserProfile(req.user._id);
        return response.success(res, 'Profile retrieved successfully', profile);
    } catch (error) {
        next(error);
    }
};

const getWorkers = async (req, res, next) => {
    try {
        const filters = {
            search: req.query.search,
            type: req.query.type,
            ratingMin: req.query.ratingMin ? parseFloat(req.query.ratingMin) : undefined,
            experienceMin: req.query.experienceMin ? parseInt(req.query.experienceMin) : undefined
        };

        const workers = await userService.getWorkersList(filters);
        return response.success(res, 'Workers retrieved successfully', { workers });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getProfile,
    getWorkers
};
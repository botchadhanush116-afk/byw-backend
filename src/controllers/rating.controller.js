// File: src/controllers/rating.controller.js
const ratingService = require('../services/rating.service');
const response = require('../utils/response');

const submitRating = async (req, res, next) => {
    try {
        const ratingData = {
            ...req.body,
            customerId: req.user._id
        };

        const rating = await ratingService.submitRating(ratingData);
        return response.success(res, 'Rating submitted successfully', { rating });
    } catch (error) {
        next(error);
    }
};

const getWorkerRatings = async (req, res, next) => {
    try {
        const ratings = await ratingService.getWorkerRatings(req.params.workerId);
        return response.success(res, 'Ratings retrieved successfully', { ratings });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    submitRating,
    getWorkerRatings
};
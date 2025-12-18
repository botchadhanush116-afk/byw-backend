// File: src/controllers/bid.controller.js
const bidService = require('../services/bid.service');
const response = require('../utils/response');

const placeBid = async (req, res, next) => {
    try {
        const bidData = {
            ...req.body,
            workerId: req.user._id,
            workerName: req.user.name
        };

        const bid = await bidService.placeBid(bidData);
        return response.success(res, 'Bid placed successfully', { bid });
    } catch (error) {
        next(error);
    }
};

const getJobBids = async (req, res, next) => {
    try {
        const bids = await bidService.getJobBids(req.params.jobId, req.user._id);
        return response.success(res, 'Bids retrieved successfully', { bids });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    placeBid,
    getJobBids
};
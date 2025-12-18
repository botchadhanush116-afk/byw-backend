// File: src/services/rating.service.js
const Rating = require('../models/rating.model');
const Job = require('../models/job.model');
const User = require('../models/user.model');
const notificationService = require('./notification.service');
const constants = require('../utils/constants');

const submitRating = async (ratingData) => {
    const { jobId, customerId, workerId, rating, review } = ratingData;

    // Check if job exists and customer owns it
    const job = await Job.findOne({
        _id: jobId,
        customerId,
        assignedTo: workerId,
        status: constants.JOB_STATUS.COMPLETED
    });

    if (!job) {
        throw new Error('Job not found or unauthorized to rate');
    }

    if (job.rated) {
        throw new Error('Job has already been rated');
    }

    // Check if rating already exists
    const existingRating = await Rating.findOne({ jobId });
    if (existingRating) {
        throw new Error('Rating already submitted for this job');
    }

    // Create rating
    const newRating = new Rating({
        jobId,
        customerId,
        workerId,
        rating,
        review
    });

    await newRating.save();

    // Update job as rated
    job.rated = true;
    await job.save();

    // Update worker's average rating
    await updateWorkerAverageRating(workerId);

    // Notify worker
    await notificationService.createNotification({
        userId: workerId,
        type: constants.NOTIFICATION_TYPES.RATING_RECEIVED,
        message: `You received a ${rating}★ rating for job "${job.title}"`,
        relatedId: job._id,
        actions: { accept: false, reject: false, extend: false }
    });

    return newRating;
};

const updateWorkerAverageRating = async (workerId) => {
    const ratings = await Rating.find({ workerId });

    if (ratings.length === 0) {
        return;
    }

    const total = ratings.reduce((sum, r) => sum + r.rating, 0);
    const average = total / ratings.length;

    await User.findByIdAndUpdate(workerId, {
        averageRating: average,
        totalRatings: ratings.length
    });
};

const getWorkerRatings = async (workerId) => {
    const ratings = await Rating.find({ workerId })
        .sort({ createdAt: -1 })
        .populate('customerId', 'name')
        .populate('jobId', 'title');

    return ratings;
};

module.exports = {
    submitRating,
    getWorkerRatings
};
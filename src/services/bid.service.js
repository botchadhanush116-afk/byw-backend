// File: src/services/bid.service.js
const Bid = require('../models/bid.model');
const Job = require('../models/job.model');
const User = require('../models/user.model');
const notificationService = require('./notification.service');
const constants = require('../utils/constants');

const placeBid = async (bidData) => {
    const { jobId, workerId, workerName, amount } = bidData;

    // Check if job exists and is open
    const job = await Job.findById(jobId);
    if (!job) {
        throw new Error('Job not found');
    }

    if (job.status !== constants.JOB_STATUS.OPEN) {
        throw new Error('Job is not open for bidding');
    }

    // Check if job has expired
    if (job.timeLimit.enabled && job.timeLimit.expiryTime && new Date() > job.timeLimit.expiryTime) {
        job.status = constants.JOB_STATUS.EXPIRED;
        await job.save();
        throw new Error('Job bidding period has expired');
    }

    // Check if worker is the customer
    if (job.customerId.toString() === workerId.toString()) {
        throw new Error('Cannot bid on your own job');
    }

    // Check if worker has already bid
    const existingBid = await Bid.findOne({ jobId, workerId });
    if (existingBid) {
        throw new Error('You have already bid on this job');
    }

    // Check if worker can do this work type
    const worker = await User.findById(workerId);
    if (!worker.workTypes.includes(job.workType)) {
        throw new Error(`You cannot bid on ${job.workType} jobs`);
    }

    // Create bid
    const bid = new Bid({
        jobId,
        workerId,
        workerName,
        amount,
        status: 'pending'
    });

    await bid.save();

    // Notify customer
    await notificationService.createNotification({
        userId: job.customerId,
        type: constants.NOTIFICATION_TYPES.BID_RECEIVED,
        message: `${workerName} placed a bid of ₹${amount} on your job "${job.title}"`,
        relatedId: job._id,
        actions: { accept: true, reject: true, extend: false }
    });

    return bid;
};

const getJobBids = async (jobId, customerId) => {
    // Verify customer owns the job
    const job = await Job.findOne({ _id: jobId, customerId });
    if (!job) {
        throw new Error('Job not found or unauthorized');
    }

    const bids = await Bid.find({ jobId })
        .sort({ amount: 1, createdAt: 1 })
        .populate('workerId', 'name email workTypes averageRating');

    return bids;
};

module.exports = {
    placeBid,
    getJobBids
};
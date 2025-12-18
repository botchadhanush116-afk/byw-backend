// File: src/services/job.service.js
const Job = require('../models/job.model');
const Bid = require('../models/bid.model');
const Chat = require('../models/chat.model');
const Wallet = require('../models/wallet.model');
const Transaction = require('../models/transaction.model');
const Payment = require('../models/payment.model');
const notificationService = require('./notification.service');
const constants = require('../utils/constants');
const timeUtils = require('../utils/time');

const createJob = async (jobData) => {
    const job = new Job(jobData);

    if (job.timeLimit.enabled && job.timeLimit.milliseconds > 0) {
        job.timeLimit.expiryTime = new Date(Date.now() + job.timeLimit.milliseconds);
    }

    await job.save();

    return job;
};

const getAvailableJobs = async (workerId, filters = {}) => {
    const { search, minBudget, workType } = filters;

    const query = {
        status: constants.JOB_STATUS.OPEN
    };

    // Get worker's work types from user (would need user service)
    // For now, filter by workType parameter
    if (workType) {
        query.workType = workType;
    }

    if (search) {
        query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
        ];
    }

    if (minBudget) {
        query.budget = { $gte: minBudget };
    }

    // Exclude jobs that worker has already bid on
    const workerBids = await Bid.find({ workerId }).select('jobId');
    const bidJobIds = workerBids.map(bid => bid.jobId.toString());

    if (bidJobIds.length > 0) {
        query._id = { $nin: bidJobIds };
    }

    const jobs = await Job.find(query)
        .sort({ createdAt: -1 })
        .limit(50);

    // Add time remaining info
    const jobsWithTimeInfo = jobs.map(job => {
        const jobObj = job.toObject();
        if (job.timeLimit.enabled && job.timeLimit.expiryTime) {
            jobObj.timeRemaining = timeUtils.formatTimeRemaining(job.timeLimit.expiryTime);
            jobObj.isAboutToExpire = timeUtils.isAboutToExpire(job.timeLimit.expiryTime);
        }
        return jobObj;
    });

    return jobsWithTimeInfo;
};

const getCustomerJobs = async (customerId) => {
    const jobs = await Job.find({ customerId })
        .sort({ createdAt: -1 });

    // Add bids count and time info
    const jobsWithDetails = await Promise.all(
        jobs.map(async (job) => {
            const jobObj = job.toObject();

            // Get bids count
            const bidCount = await Bid.countDocuments({ jobId: job._id });
            jobObj.bidCount = bidCount;

            // Add time info
            if (job.timeLimit.enabled && job.timeLimit.expiryTime) {
                jobObj.timeRemaining = timeUtils.formatTimeRemaining(job.timeLimit.expiryTime);
                jobObj.isAboutToExpire = timeUtils.isAboutToExpire(job.timeLimit.expiryTime);
            }

            return jobObj;
        })
    );

    return jobsWithDetails;
};

const getJobById = async (jobId, user) => {
    const job = await Job.findById(jobId);

    if (!job) {
        throw new Error('Job not found');
    }

    // Authorization check
    const isCustomer = job.customerId.toString() === user._id.toString();
    const isWorker = job.assignedTo && job.assignedTo.toString() === user._id.toString();

    if (!isCustomer && !isWorker && !user.roles.includes(constants.USER_ROLES.ADMIN)) {
        throw new Error('Unauthorized to view this job');
    }

    return job;
};

const cancelJob = async (jobId, customerId) => {
    const job = await Job.findOne({ _id: jobId, customerId });

    if (!job) {
        throw new Error('Job not found or unauthorized');
    }

    if (job.status !== constants.JOB_STATUS.OPEN && job.status !== constants.JOB_STATUS.EXPIRED) {
        throw new Error('Cannot cancel job in current status');
    }

    if (job.assignedTo) {
        throw new Error('Cannot cancel job that has been assigned');
    }

    job.status = constants.JOB_STATUS.CANCELLED;
    await job.save();

    // Notify any bidders
    const bids = await Bid.find({ jobId });
    for (const bid of bids) {
        await notificationService.createNotification({
            userId: bid.workerId,
            type: constants.NOTIFICATION_TYPES.JOB_CANCELLED,
            message: `Job "${job.title}" has been cancelled by the customer`,
            relatedId: job._id
        });
    }

    return job;
};

const extendJobTimeLimit = async (jobId, customerId) => {
    const job = await Job.findOne({ _id: jobId, customerId });

    if (!job) {
        throw new Error('Job not found or unauthorized');
    }

    if (!job.timeLimit.enabled) {
        throw new Error('Job does not have time limit enabled');
    }

    if (job.status !== constants.JOB_STATUS.EXPIRED) {
        throw new Error('Only expired jobs can be extended');
    }

    // Extend by 24 hours
    const extensionMs = 24 * 60 * 60 * 1000;
    job.timeLimit.milliseconds += extensionMs;
    job.timeLimit.expiryTime = new Date(Date.now() + job.timeLimit.milliseconds);
    job.status = constants.JOB_STATUS.OPEN;

    await job.save();

    // Notify bidders
    const bids = await Bid.find({ jobId });
    for (const bid of bids) {
        await notificationService.createNotification({
            userId: bid.workerId,
            type: constants.NOTIFICATION_TYPES.TIME_LIMIT_EXTENDED,
            message: `Job "${job.title}" time limit has been extended by 24 hours`,
            relatedId: job._id,
            actions: { accept: false, reject: false, extend: false }
        });
    }

    return job;
};

const assignWorkerToJob = async (jobId, workerId, customerId) => {
    const job = await Job.findOne({ _id: jobId, customerId });

    if (!job) {
        throw new Error('Job not found or unauthorized');
    }

    if (job.status !== constants.JOB_STATUS.OPEN) {
        throw new Error('Cannot assign worker to job in current status');
    }

    // Check if worker has bid on this job
    const bid = await Bid.findOne({ jobId, workerId });
    if (!bid) {
        throw new Error('Worker has not bid on this job');
    }

    // Update job
    job.assignedTo = workerId;
    job.assignedToName = bid.workerName;
    job.assignedToPhone = ''; // Would need to fetch from user profile
    job.budget = bid.amount; // Update budget to accepted bid amount
    job.status = constants.JOB_STATUS.ASSIGNED;

    // Reject other bids
    await Bid.updateMany(
        { jobId, workerId: { $ne: workerId } },
        { status: 'rejected' }
    );

    // Accept selected bid
    bid.status = 'accepted';
    await bid.save();

    await job.save();

    // Create chat for communication
    const chat = new Chat({
        jobId: job._id,
        customerId: job.customerId,
        customerName: job.customerName,
        workerId: job.assignedTo,
        workerName: job.assignedToName,
        jobTitle: job.title
    });

    await chat.save();

    // Notify worker
    await notificationService.createNotification({
        userId: workerId,
        type: constants.NOTIFICATION_TYPES.JOB_ASSIGNED,
        message: `You have been assigned to job "${job.title}"`,
        relatedId: job._id,
        actions: { accept: false, reject: false, extend: false }
    });

    return job;
};

const markJobCompleted = async (jobId, workerId) => {
    const job = await Job.findOne({ _id: jobId, assignedTo: workerId });

    if (!job) {
        throw new Error('Job not found or unauthorized');
    }

    if (job.status !== constants.JOB_STATUS.ASSIGNED) {
        throw new Error('Job cannot be marked as completed in current status');
    }

    job.status = constants.JOB_STATUS.COMPLETED_PENDING;
    await job.save();

    // Notify customer
    await notificationService.createNotification({
        userId: job.customerId,
        type: constants.NOTIFICATION_TYPES.JOB_COMPLETED,
        message: `Worker has marked job "${job.title}" as completed. Please confirm completion.`,
        relatedId: job._id,
        actions: { accept: true, reject: false, extend: false }
    });

    return job;
};

const confirmJobCompletion = async (jobId, customerId) => {
    const job = await Job.findOne({ _id: jobId, customerId });

    if (!job) {
        throw new Error('Job not found or unauthorized');
    }

    if (job.status !== constants.JOB_STATUS.COMPLETED_PENDING) {
        throw new Error('Job is not pending completion confirmation');
    }

    job.status = constants.JOB_STATUS.COMPLETED;
    job.completedDate = new Date();
    await job.save();

    // Create payment record (customer will make payment later)
    const payment = new Payment({
        jobId: job._id,
        customerId: job.customerId,
        workerId: job.assignedTo,
        amount: job.budget,
        method: constants.PAYMENT_METHODS.QR, // Default method
        reference: `JOB_${job._id}`,
        status: constants.TRANSACTION_STATUS.PENDING
    });

    await payment.save();

    // Notify worker
    await notificationService.createNotification({
        userId: job.assignedTo,
        type: constants.NOTIFICATION_TYPES.COMPLETION_CONFIRMED,
        message: `Customer has confirmed completion of job "${job.title}". Payment pending.`,
        relatedId: job._id,
        actions: { accept: false, reject: false, extend: false }
    });

    return job;
};

module.exports = {
    createJob,
    getAvailableJobs,
    getCustomerJobs,
    getJobById,
    cancelJob,
    extendJobTimeLimit,
    assignWorkerToJob,
    markJobCompleted,
    confirmJobCompletion
};
// File: src/controllers/job.controller.js
const jobService = require('../services/job.service');
const response = require('../utils/response');

const createJob = async (req, res, next) => {
    try {
        const jobData = {
            ...req.body,
            customerId: req.user._id,
            customerName: req.user.name,
            customerPhone: req.user.mobile
        };

        const job = await jobService.createJob(jobData);
        return response.success(res, 'Job created successfully', { job });
    } catch (error) {
        next(error);
    }
};

const getAvailableJobs = async (req, res, next) => {
    try {
        const filters = {
            search: req.query.search,
            minBudget: req.query.minBudget ? parseFloat(req.query.minBudget) : undefined,
            workType: req.query.workType
        };

        const jobs = await jobService.getAvailableJobs(req.user._id, filters);
        return response.success(res, 'Jobs retrieved successfully', { jobs });
    } catch (error) {
        next(error);
    }
};

const getMyJobs = async (req, res, next) => {
    try {
        const jobs = await jobService.getCustomerJobs(req.user._id);
        return response.success(res, 'Jobs retrieved successfully', { jobs });
    } catch (error) {
        next(error);
    }
};

const getJob = async (req, res, next) => {
    try {
        const job = await jobService.getJobById(req.params.id, req.user);
        return response.success(res, 'Job retrieved successfully', { job });
    } catch (error) {
        next(error);
    }
};

const cancelJob = async (req, res, next) => {
    try {
        await jobService.cancelJob(req.params.id, req.user._id);
        return response.success(res, 'Job cancelled successfully');
    } catch (error) {
        next(error);
    }
};

const extendJobTime = async (req, res, next) => {
    try {
        const job = await jobService.extendJobTimeLimit(req.params.id, req.user._id);
        return response.success(res, 'Job time extended successfully', { job });
    } catch (error) {
        next(error);
    }
};

const assignWorker = async (req, res, next) => {
    try {
        const job = await jobService.assignWorkerToJob(req.params.id, req.body.workerId, req.user._id);
        return response.success(res, 'Worker assigned successfully', { job });
    } catch (error) {
        next(error);
    }
};

const markJobCompleted = async (req, res, next) => {
    try {
        await jobService.markJobCompleted(req.params.id, req.user._id);
        return response.success(res, 'Job marked as completed. Waiting for customer confirmation.');
    } catch (error) {
        next(error);
    }
};

const confirmCompletion = async (req, res, next) => {
    try {
        await jobService.confirmJobCompletion(req.params.id, req.user._id);
        return response.success(res, 'Job completion confirmed');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createJob,
    getAvailableJobs,
    getMyJobs,
    getJob,
    cancelJob,
    extendJobTime,
    assignWorker,
    markJobCompleted,
    confirmCompletion
};
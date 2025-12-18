// File: src/services/payment.service.js
const Payment = require('../models/payment.model');
const Job = require('../models/job.model');
const Wallet = require('../models/wallet.model');
const Transaction = require('../models/transaction.model');
const notificationService = require('./notification.service');
const walletService = require('./wallet.service');
const constants = require('../utils/constants');

const createPayment = async (paymentData) => {
    const { jobId, customerId, method, reference } = paymentData;

    // Check if job exists and is completed
    const job = await Job.findById(jobId);
    if (!job) {
        throw new Error('Job not found');
    }

    if (job.status !== constants.JOB_STATUS.COMPLETED) {
        throw new Error('Job must be completed before payment');
    }

    if (job.customerId.toString() !== customerId.toString()) {
        throw new Error('Unauthorized to pay for this job');
    }

    if (job.paid) {
        throw new Error('Job has already been paid');
    }

    // Check if payment already exists
    const existingPayment = await Payment.findOne({ jobId });
    if (existingPayment) {
        throw new Error('Payment already initiated for this job');
    }

    // Create payment record
    const payment = new Payment({
        jobId,
        customerId,
        workerId: job.assignedTo,
        amount: job.budget,
        method,
        reference,
        status: constants.TRANSACTION_STATUS.PENDING
    });

    await payment.save();

    // Process payment
    await processPayment(payment._id);

    return payment;
};

const processPayment = async (paymentId) => {
    const payment = await Payment.findById(paymentId);

    if (!payment) {
        throw new Error('Payment not found');
    }

    if (payment.status !== constants.TRANSACTION_STATUS.PENDING) {
        throw new Error('Payment already processed');
    }

    try {
        // For QR payments, we assume they're always successful in this demo
        // In production, integrate with actual payment gateway

        // 1. Deduct from customer wallet
        await walletService.debitCustomerPayment(
            payment.customerId,
            payment.amount,
            payment.jobId
        );

        // 2. Credit to worker wallet
        await walletService.creditWorkerEarnings(
            payment.workerId,
            payment.amount,
            payment.jobId
        );

        // 3. Update payment status
        payment.status = constants.TRANSACTION_STATUS.COMPLETED;
        payment.processedAt = new Date();
        await payment.save();

        // 4. Update job as paid
        await Job.findByIdAndUpdate(payment.jobId, { paid: true });

        // 5. Notify worker
        await notificationService.createNotification({
            userId: payment.workerId,
            type: constants.NOTIFICATION_TYPES.PAYMENT_RECEIVED,
            message: `Payment of ₹${payment.amount} received for job`,
            relatedId: payment.jobId,
            actions: { accept: false, reject: false, extend: false }
        });

        return payment;

    } catch (error) {
        // Mark payment as failed
        payment.status = constants.TRANSACTION_STATUS.FAILED;
        await payment.save();

        throw error;
    }
};

module.exports = {
    createPayment,
    processPayment
};
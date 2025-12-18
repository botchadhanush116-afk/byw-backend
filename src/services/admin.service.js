// File: src/services/admin.service.js
const User = require('../models/user.model');
const Job = require('../models/job.model');
const Payment = require('../models/payment.model');
const Transaction = require('../models/transaction.model');
const constants = require('../utils/constants');

const generateReports = async () => {
    const totalUsers = await User.countDocuments();
    const totalWorkers = await User.countDocuments({ roles: constants.USER_ROLES.WORKER });
    const totalCustomers = await User.countDocuments({ roles: constants.USER_ROLES.CUSTOMER });

    const totalJobs = await Job.countDocuments();
    const openJobs = await Job.countDocuments({ status: constants.JOB_STATUS.OPEN });
    const completedJobs = await Job.countDocuments({ status: constants.JOB_STATUS.COMPLETED });

    const totalPayments = await Payment.countDocuments();
    const completedPayments = await Payment.countDocuments({ status: constants.TRANSACTION_STATUS.COMPLETED });
    const pendingPayments = await Payment.countDocuments({ status: constants.TRANSACTION_STATUS.PENDING });

    const totalTransactions = await Transaction.countDocuments();
    const totalTransactionAmount = await Transaction.aggregate([
        { $match: { status: constants.TRANSACTION_STATUS.COMPLETED } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const recentJobs = await Job.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .select('title status budget createdAt');

    const recentPayments = await Payment.find()
        .sort({ createdAt: -1 })
        .limit(10)
        .populate('customerId', 'name')
        .populate('workerId', 'name')
        .select('amount method status createdAt');

    return {
        summary: {
            totalUsers,
            totalWorkers,
            totalCustomers,
            totalJobs,
            openJobs,
            completedJobs,
            totalPayments,
            completedPayments,
            pendingPayments,
            totalTransactions,
            totalAmount: totalTransactionAmount[0]?.total || 0
        },
        recentJobs,
        recentPayments
    };
};

module.exports = {
    generateReports
};
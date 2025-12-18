// File: src/services/wallet.service.js
const Wallet = require('../models/wallet.model');
const Transaction = require('../models/transaction.model');
const User = require('../models/user.model');
const constants = require('../utils/constants');

const getUserWallet = async (userId) => {
    let wallet = await Wallet.findOne({ userId });

    if (!wallet) {
        // Create wallet if it doesn't exist
        wallet = new Wallet({
            userId,
            balance: 0
        });
        await wallet.save();
    }

    return wallet;
};

const getWalletHistory = async (userId) => {
    const transactions = await Transaction.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50);

    return transactions;
};

const addMoneyToWallet = async (userId, amount) => {
    if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
    }

    const wallet = await getUserWallet(userId);

    // Update wallet balance
    wallet.balance += amount;
    wallet.totalSpent += amount; // For customer, adding money is spending
    await wallet.save();

    // Create transaction record
    const transaction = new Transaction({
        userId,
        type: constants.TRANSACTION_TYPES.CREDIT,
        amount,
        description: `Added money to wallet`,
        status: constants.TRANSACTION_STATUS.COMPLETED,
        details: { method: 'manual_add' }
    });

    await transaction.save();

    return transaction;
};

const withdrawMoney = async (userId, amount, method, details = {}) => {
    if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
    }

    const wallet = await getUserWallet(userId);

    // Check sufficient balance
    if (wallet.balance < amount) {
        throw new Error('Insufficient balance');
    }

    // Update wallet balance
    wallet.balance -= amount;
    wallet.totalEarned += amount; // For worker, withdrawal is from earnings
    await wallet.save();

    // Create transaction record
    const transaction = new Transaction({
        userId,
        type: constants.TRANSACTION_TYPES.DEBIT,
        amount,
        description: `Withdrawal via ${method}`,
        status: constants.TRANSACTION_STATUS.PENDING, // Admin must approve withdrawals
        details: {
            method,
            ...details,
            requestedAt: new Date()
        }
    });

    await transaction.save();

    return transaction;
};

const creditWorkerEarnings = async (workerId, amount, jobId) => {
    const wallet = await getUserWallet(workerId);

    wallet.balance += amount;
    wallet.totalEarned += amount;
    await wallet.save();

    // Create transaction record
    const transaction = new Transaction({
        userId: workerId,
        type: constants.TRANSACTION_TYPES.CREDIT,
        amount,
        description: `Payment for job ${jobId}`,
        status: constants.TRANSACTION_STATUS.COMPLETED,
        referenceId: jobId,
        details: { source: 'job_payment' }
    });

    await transaction.save();

    return transaction;
};

const debitCustomerPayment = async (customerId, amount, jobId) => {
    const wallet = await getUserWallet(customerId);

    // Check sufficient balance
    if (wallet.balance < amount) {
        throw new Error('Insufficient wallet balance');
    }

    wallet.balance -= amount;
    wallet.totalSpent += amount;
    await wallet.save();

    // Create transaction record
    const transaction = new Transaction({
        userId: customerId,
        type: constants.TRANSACTION_TYPES.DEBIT,
        amount,
        description: `Payment for job ${jobId}`,
        status: constants.TRANSACTION_STATUS.COMPLETED,
        referenceId: jobId,
        details: { destination: 'worker_payment' }
    });

    await transaction.save();

    return transaction;
};

module.exports = {
    getUserWallet,
    getWalletHistory,
    addMoneyToWallet,
    withdrawMoney,
    creditWorkerEarnings,
    debitCustomerPayment
};
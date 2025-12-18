// File: src/controllers/transaction.controller.js
const transactionService = require('../services/transaction.service');
const response = require('../utils/response');

const getTransactionHistory = async (req, res, next) => {
    try {
        const transactions = await transactionService.getUserTransactions(req.user._id);
        return response.success(res, 'Transactions retrieved successfully', { transactions });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getTransactionHistory
};
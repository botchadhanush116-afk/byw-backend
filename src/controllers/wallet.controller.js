// File: src/controllers/wallet.controller.js
const walletService = require('../services/wallet.service');
const response = require('../utils/response');

const getWallet = async (req, res, next) => {
    try {
        const wallet = await walletService.getUserWallet(req.user._id);
        return response.success(res, 'Wallet retrieved successfully', { wallet });
    } catch (error) {
        next(error);
    }
};

const getWalletHistory = async (req, res, next) => {
    try {
        const transactions = await walletService.getWalletHistory(req.user._id);
        return response.success(res, 'Wallet history retrieved successfully', { transactions });
    } catch (error) {
        next(error);
    }
};

const addMoney = async (req, res, next) => {
    try {
        const transaction = await walletService.addMoneyToWallet(req.user._id, req.body.amount);
        return response.success(res, 'Money added to wallet successfully', { transaction });
    } catch (error) {
        next(error);
    }
};

const withdrawMoney = async (req, res, next) => {
    try {
        const { amount, method, ...details } = req.body;
        const transaction = await walletService.withdrawMoney(req.user._id, amount, method, details);
        return response.success(res, 'Withdrawal request submitted successfully', { transaction });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getWallet,
    getWalletHistory,
    addMoney,
    withdrawMoney
};
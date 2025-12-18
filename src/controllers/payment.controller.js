// File: src/controllers/payment.controller.js
const paymentService = require('../services/payment.service');
const response = require('../utils/response');

const createPayment = async (req, res, next) => {
    try {
        const payment = await paymentService.createPayment({
            ...req.body,
            customerId: req.user._id
        });

        return response.success(res, 'Payment created successfully', { payment });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createPayment
};
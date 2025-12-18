// File: src/middlewares/validate.middleware.js
const Joi = require('joi');
const response = require('../utils/response');

const validate = (schema) => {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, { abortEarly: false });

        if (error) {
            const errors = error.details.map(detail => detail.message);
            return response.badRequest(res, errors.join(', '));
        }

        next();
    };
};

// Validation schemas
const authSchemas = {
    register: Joi.object({
        name: Joi.string().min(2).max(100).required(),
        gender: Joi.string().valid('Male', 'Female', 'Other').required(),
        dob: Joi.date().max(new Date()).required(),
        mobile: Joi.string().pattern(/^[0-9]{10}$/).required(),
        email: Joi.string().email().required(),
        password: Joi.string().min(8).required(),
        workTypes: Joi.array().items(Joi.string().valid('academic', 'general')).min(1)
    }),

    login: Joi.object({
        email: Joi.string().email().required(),
        password: Joi.string().required()
    }),

    selectRole: Joi.object({
        role: Joi.string().valid('customer', 'worker').required()
    }),

    forgotPassword: Joi.object({
        email: Joi.string().email().required()
    }),

    verifyOtp: Joi.object({
        email: Joi.string().email().required(),
        otp: Joi.string().length(6).pattern(/^[0-9]+$/).required()
    }),

    resetPassword: Joi.object({
        email: Joi.string().email().required(),
        newPassword: Joi.string().min(8).required()
    })
};

const jobSchemas = {
    createJob: Joi.object({
        title: Joi.string().min(5).max(200).required(),
        description: Joi.string().min(10).max(2000).required(),
        budget: Joi.number().min(1).required(),
        workType: Joi.string().valid('academic', 'general').required(),
        contact: Joi.string().required(),
        timeLimit: Joi.object({
            enabled: Joi.boolean().required(),
            milliseconds: Joi.when('enabled', {
                is: true,
                then: Joi.number().min(300000).max(2592000000).required(), // 5 minutes to 30 days
                otherwise: Joi.number().valid(0)
            })
        }).required()
    }),

    assignWorker: Joi.object({
        workerId: Joi.string().required()
    })
};

const bidSchemas = {
    placeBid: Joi.object({
        jobId: Joi.string().required(),
        amount: Joi.number().min(1).required()
    })
};

const walletSchemas = {
    addMoney: Joi.object({
        amount: Joi.number().min(1).max(1000000).required()
    }),

    withdrawMoney: Joi.object({
        amount: Joi.number().min(1).required(),
        method: Joi.string().valid('bank', 'upi', 'paytm', 'cash').required(),
        account: Joi.when('method', {
            is: 'bank',
            then: Joi.string().required()
        }),
        ifscCode: Joi.when('method', {
            is: 'bank',
            then: Joi.string().required()
        }),
        accountHolder: Joi.when('method', {
            is: 'bank',
            then: Joi.string().required()
        }),
        upiId: Joi.when('method', {
            is: 'upi',
            then: Joi.string().required()
        })
    })
};

const paymentSchemas = {
    createPayment: Joi.object({
        jobId: Joi.string().required(),
        method: Joi.string().valid('qr').required(), // Add other methods as needed
        reference: Joi.string().required()
    })
};

const ratingSchemas = {
    submitRating: Joi.object({
        jobId: Joi.string().required(),
        workerId: Joi.string().required(),
        rating: Joi.number().min(1).max(5).required(),
        review: Joi.string().max(500).allow('')
    })
};

const chatSchemas = {
    createChat: Joi.object({
        jobId: Joi.string().required()
    })
};

const messageSchemas = {
    sendMessage: Joi.object({
        chatId: Joi.string().required(),
        text: Joi.string().min(1).max(1000).required()
    })
};

module.exports = {
    validate,
    schemas: {
        ...authSchemas,
        ...jobSchemas,
        ...bidSchemas,
        ...walletSchemas,
        ...paymentSchemas,
        ...ratingSchemas,
        ...chatSchemas,
        ...messageSchemas
    }
};
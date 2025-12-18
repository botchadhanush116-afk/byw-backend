// File: src/services/transaction.service.js
const Transaction = require('../models/transaction.model');
const Payment = require('../models/payment.model');

const getUserTransactions = async (userId) => {
    const transactions = await Transaction.find({ userId })
        .sort({ createdAt: -1 })
        .limit(100);

    const payments = await Payment.find({
        $or: [{ customerId: userId }, { workerId: userId }]
    })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('jobId', 'title');

    // Combine and format transactions and payments
    const allTransactions = [
        ...transactions.map(t => ({
            id: t._id,
            type: t.type,
            amount: t.amount,
            description: t.description,
            date: t.createdAt,
            status: t.status,
            details: t.details
        })),
        ...payments.map(p => ({
            id: p._id,
            type: 'payment',
            amount: p.amount,
            description: `Payment for job: ${p.jobId?.title || 'N/A'}`,
            date: p.createdAt,
            status: p.status,
            details: {
                method: p.method,
                reference: p.reference,
                jobId: p.jobId
            }
        }))
    ];

    // Sort by date descending
    allTransactions.sort((a, b) => b.date - a.date);

    return allTransactions;
};

module.exports = {
    getUserTransactions
};
// File: src/utils/constants.js
module.exports = {
    USER_ROLES: {
        CUSTOMER: 'customer',
        WORKER: 'worker',
        ADMIN: 'admin'
    },

    JOB_STATUS: {
        OPEN: 'Open',
        ASSIGNED: 'Assigned',
        COMPLETED_PENDING: 'Completed-Pending',
        COMPLETED: 'Completed',
        CANCELLED: 'Cancelled',
        EXPIRED: 'Expired'
    },

    TRANSACTION_TYPES: {
        CREDIT: 'credit',
        DEBIT: 'debit'
    },

    TRANSACTION_STATUS: {
        PENDING: 'pending',
        COMPLETED: 'completed',
        FAILED: 'failed'
    },

    PAYMENT_METHODS: {
        QR: 'qr',
        UPI: 'upi',
        CARD: 'card',
        BANK: 'bank'
    },

    NOTIFICATION_TYPES: {
        BID_RECEIVED: 'bid_received',
        JOB_ASSIGNED: 'job_assigned',
        JOB_COMPLETED: 'job_completed',
        PAYMENT_RECEIVED: 'payment_received',
        RATING_RECEIVED: 'rating_received',
        TIME_LIMIT_EXPIRING: 'time_limit_expiring'
    },

    WORK_TYPES: {
        ACADEMIC: 'academic',
        GENERAL: 'general'
    }
};
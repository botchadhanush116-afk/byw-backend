// File: src/app.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const env = require('./config/env');
const corsConfig = require('./config/cors');
const errorMiddleware = require('./middlewares/error.middleware');
const logger = require('./config/logger');

// Import routes
const authRoutes = require('./routes/auth.routes');
const userRoutes = require('./routes/user.routes');
const jobRoutes = require('./routes/job.routes');
const bidRoutes = require('./routes/bid.routes');
const walletRoutes = require('./routes/wallet.routes');
const paymentRoutes = require('./routes/payment.routes');
const transactionRoutes = require('./routes/transaction.routes');
const chatRoutes = require('./routes/chat.routes');
const messageRoutes = require('./routes/message.routes');
const notificationRoutes = require('./routes/notification.routes');
const ratingRoutes = require('./routes/rating.routes');
const locationRoutes = require('./routes/location.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});
app.use('/api', limiter);

// CORS configuration
app.use(cors(corsConfig));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
    logger.info(`${req.method} ${req.path} - ${req.ip}`);
    next();
});

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        service: 'BYW Backend API',
        version: '1.0.0'
    });
});

// Root route - API information
app.get('/', (req, res) => {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    res.status(200).json({
        message: 'BYW (Bid Your Work) Backend API',
        version: '1.0.0',
        status: 'operational',
        documentation: 'See API endpoints list for complete documentation',
        endpoints: {
            auth: `${baseUrl}/api/v1/auth`,
            users: `${baseUrl}/api/v1/users`,
            jobs: `${baseUrl}/api/v1/jobs`,
            bids: `${baseUrl}/api/v1/bids`,
            wallet: `${baseUrl}/api/v1/wallet`,
            payments: `${baseUrl}/api/v1/payments`,
            transactions: `${baseUrl}/api/v1/transactions`,
            chats: `${baseUrl}/api/v1/chats`,
            messages: `${baseUrl}/api/v1/messages`,
            notifications: `${baseUrl}/api/v1/notifications`,
            ratings: `${baseUrl}/api/v1/ratings`,
            location: `${baseUrl}/api/v1/location`,
            admin: `${baseUrl}/api/v1/admin`
        },
        health: `${baseUrl}/health`
    });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/jobs', jobRoutes);
app.use('/api/v1/bids', bidRoutes);
app.use('/api/v1/wallet', walletRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/transactions', transactionRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/messages', messageRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/ratings', ratingRoutes);
app.use('/api/v1/location', locationRoutes);
app.use('/api/v1/admin', adminRoutes);

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `API route ${req.originalUrl} not found`
    });
});

// Serve frontend in production (optional - if serving from same domain)
if (env.NODE_ENV === 'production') {
    // Serve static files from frontend directory
    app.use(express.static(path.join(__dirname, '../public')));

    // Handle SPA routing - serve index.html for any non-API route
    app.get('*', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(__dirname, '../public/index.html'));
        }
    });
}

// Global error handler
app.use(errorMiddleware);

module.exports = app;
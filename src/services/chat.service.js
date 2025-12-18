// File: src/services/chat.service.js
const Chat = require('../models/chat.model');
const Job = require('../models/job.model');
const Message = require('../models/message.model');
const constants = require('../utils/constants');

const createOrGetChat = async (jobId, user) => {
    // Check if job exists and user is authorized
    const job = await Job.findById(jobId);

    if (!job) {
        throw new Error('Job not found');
    }

    // Check if user is customer or assigned worker
    const isCustomer = job.customerId.toString() === user._id.toString();
    const isWorker = job.assignedTo && job.assignedTo.toString() === user._id.toString();

    if (!isCustomer && !isWorker) {
        throw new Error('Unauthorized to access chat for this job');
    }

    // Check if job is assigned
    if (job.status !== constants.JOB_STATUS.ASSIGNED &&
        job.status !== constants.JOB_STATUS.COMPLETED_PENDING &&
        job.status !== constants.JOB_STATUS.COMPLETED) {
        throw new Error('Chat is only available for assigned or completed jobs');
    }

    // Find or create chat
    let chat = await Chat.findOne({ jobId });

    if (!chat) {
        // Get worker details
        const worker = job.assignedTo ?
            await require('../models/user.model').findById(job.assignedTo) : null;

        chat = new Chat({
            jobId,
            customerId: job.customerId,
            customerName: job.customerName,
            workerId: job.assignedTo,
            workerName: worker ? worker.name : 'Unknown Worker',
            jobTitle: job.title
        });

        await chat.save();
    }

    return chat;
};

const getUserChats = async (userId, userRole) => {
    const query = userRole === constants.USER_ROLES.CUSTOMER
        ? { customerId: userId }
        : { workerId: userId };

    const chats = await Chat.find(query)
        .sort({ updatedAt: -1 })
        .limit(50);

    // Get unread counts
    const chatsWithUnread = await Promise.all(
        chats.map(async (chat) => {
            const unreadField = userRole === constants.USER_ROLES.CUSTOMER
                ? 'unreadCountCustomer'
                : 'unreadCountWorker';

            return {
                id: chat._id,
                jobId: chat.jobId,
                otherName: userRole === constants.USER_ROLES.CUSTOMER
                    ? chat.workerName
                    : chat.customerName,
                jobTitle: chat.jobTitle,
                lastMessage: chat.lastMessage,
                unreadCount: chat[unreadField],
                updatedAt: chat.updatedAt
            };
        })
    );

    return chatsWithUnread;
};

const updateChatLastMessage = async (chatId, message) => {
    await Chat.findByIdAndUpdate(chatId, {
        lastMessage: {
            text: message.text,
            senderId: message.senderId,
            timestamp: message.createdAt
        },
        updatedAt: new Date()
    });
};

const incrementUnreadCount = async (chatId, recipientRole) => {
    const updateField = recipientRole === constants.USER_ROLES.CUSTOMER
        ? { $inc: { unreadCountCustomer: 1 } }
        : { $inc: { unreadCountWorker: 1 } };

    await Chat.findByIdAndUpdate(chatId, updateField);
};

const resetUnreadCount = async (chatId, userRole) => {
    const updateField = userRole === constants.USER_ROLES.CUSTOMER
        ? { unreadCountCustomer: 0 }
        : { unreadCountWorker: 0 };

    await Chat.findByIdAndUpdate(chatId, updateField);
};

module.exports = {
    createOrGetChat,
    getUserChats,
    updateChatLastMessage,
    incrementUnreadCount,
    resetUnreadCount
};
// File: src/controllers/admin.controller.js
const adminService = require('../services/admin.service');
const response = require('../utils/response');

const getReports = async (req, res, next) => {
    try {
        const reports = await adminService.generateReports();
        return response.success(res, 'Reports generated successfully', { reports });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getReports
};
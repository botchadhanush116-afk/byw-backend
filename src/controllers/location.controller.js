// File: src/controllers/location.controller.js
const locationService = require('../services/location.service');
const response = require('../utils/response');

const saveLocation = async (req, res, next) => {
    try {
        await locationService.saveUserLocation(req.user._id, req.body);
        return response.success(res, 'Location saved successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    saveLocation
};
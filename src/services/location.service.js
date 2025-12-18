// File: src/services/location.service.js
const Location = require('../models/location.model');
const User = require('../models/user.model');

const saveUserLocation = async (userId, locationData) => {
    const { latitude, longitude } = locationData;

    if (!latitude || !longitude) {
        throw new Error('Latitude and longitude are required');
    }

    // Save location history
    const location = new Location({
        userId,
        coordinates: [longitude, latitude], // GeoJSON format: [longitude, latitude]
        timestamp: new Date()
    });

    await location.save();

    // Update user's current location
    await User.findByIdAndUpdate(userId, {
        location: {
            type: 'Point',
            coordinates: [longitude, latitude]
        }
    });

    return location;
};

module.exports = {
    saveUserLocation
};
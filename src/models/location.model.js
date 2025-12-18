// File: src/models/location.model.js
const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    coordinates: {
        type: [Number],
        required: true,
        validate: {
            validator: function (v) {
                return v.length === 2;
            },
            message: 'Coordinates must be [longitude, latitude]'
        }
    },
    address: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

// Index for geospatial queries
locationSchema.index({ coordinates: '2dsphere' });
locationSchema.index({ userId: 1, timestamp: -1 });

const Location = mongoose.model('Location', locationSchema);

module.exports = Location;
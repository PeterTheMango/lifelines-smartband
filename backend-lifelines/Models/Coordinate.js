const mongoose = require('mongoose');

const coordinateSchema = new mongoose.Schema({
    macAddress: String,
    longtitude: Number,
    latitude: Number,
    timestamp: Date
});

module.exports = mongoose.model('Coordinate', coordinateSchema);
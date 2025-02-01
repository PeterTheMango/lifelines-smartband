const mongoose = require("mongoose");

const coordinatesSchema = new mongoose.Schema({
  macAddress: {
    type: String,
    required: true,
  },
  latitude: {
    type: Number,
    required: true,
  },
  longitude: {
    type: Number,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Coordinates", coordinatesSchema);

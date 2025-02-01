const mongoose = require("mongoose");

const obstacleSchema = new mongoose.Schema({
  obstacleId: {
    type: String,
    required: false,
  },
  timeStart: {
    type: Date,
    required: true,
    default: Date.now(),
  },
  timeEnd: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Obstacle", obstacleSchema);

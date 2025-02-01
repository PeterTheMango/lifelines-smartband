const mongoose = require("mongoose");

const consentSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  serialNumber: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    required: true,
  },
  nationalId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Consent", consentSchema);

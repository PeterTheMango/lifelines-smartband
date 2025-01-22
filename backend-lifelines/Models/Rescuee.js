const mongoose = require('mongoose');

const rescueeSchema = new mongoose.Schema({
    macAddress: String,
    name: String,
    id: String,
    nationality: String,
    gender: String,
    dateOfBirth: Date,
    phone: String,
    address: String,
});

module.exports = mongoose.model('Rescuee', rescueeSchema);
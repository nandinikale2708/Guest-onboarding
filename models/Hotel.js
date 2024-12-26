const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
    name: String,
    address: String,
    logo: String,
    qrCode: String
});

module.exports = mongoose.model('Hotel', hotelSchema);
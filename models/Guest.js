const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
    fullName: String,
    mobileNumber: String,
    address: String,
    purposeOfVisit: String,
    stayFrom: Date,
    stayTo: Date,
    email: String,
    idProofNumber: String
});

module.exports = mongoose.model('Guest', guestSchema);
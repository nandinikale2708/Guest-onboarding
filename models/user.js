// models/User.js
const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

let User; // Declare the User variable outside the conditional

try {
  // Try to retrieve the model if it already exists
  User = mongoose.model('User');
} catch (error) {
  // If the model doesn't exist, define it
  const UserSchema = new mongoose.Schema({
    // Add any additional fields here if needed
  });

  UserSchema.plugin(passportLocalMongoose);
  User = mongoose.model('User', UserSchema);
}

module.exports = User;
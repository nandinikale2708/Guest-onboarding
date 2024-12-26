const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User'); // Path to your User model

passport.use(new LocalStrategy(User.authenticate())); // Use the authenticate method provided by passport-local-mongoose
passport.serializeUser(User.serializeUser()); // Serialize user for session storage
passport.deserializeUser(User.deserializeUser()); // Deserialize user from session storage

module.exports = passport;
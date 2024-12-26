const express = require('express');
const router = express.Router();
const Guest = require('../models/Guest');
const Hotel = require('../models/Hotel');
const { body, validationResult } = require('express-validator');
const passport = require('../config/passport');
const User = require('../models/User');

// Display guest details for a hotel
router.get('/guests/:hotelId', async (req, res) => {
    try {
        const guests = await Guest.find({ hotelId: req.params.hotelId });
        const hotel = await Hotel.findById(req.params.hotelId);
        if (!hotel) return res.status(404).send('Hotel not found');
        res.render('guestAdmin/guests', { guests, hotel });
    } catch (err) { res.status(500).send(err.message); }
});

// View single guest
router.get('/view/:guestId', async (req, res) => {
    try {
        const guest = await Guest.findById(req.params.guestId).populate('hotelId');
        if (!guest) return res.status(404).send('Guest not found');
        res.render('guestAdmin/viewGuest', { guest });
    } catch (err) { res.status(500).send(err.message); }
});

// Edit guest form
router.get('/edit/:guestId', async (req, res) => {
    try {
        const guest = await Guest.findById(req.params.guestId);
        if (!guest) return res.status(404).send('Guest not found');
        res.render('guestAdmin/editGuest', { guest });
    } catch (err) { res.status(500).send(err.message); }
});

router.post('/submit-form', [
    body('fullName').notEmpty().withMessage('Full Name is required').trim().escape(),
    body('mobileNumber').isMobilePhone('any').withMessage('Invalid mobile number').trim().escape(),
    body('email').isEmail().withMessage('Invalid email address').optional({ checkFalsy: true }).trim().escape(),
    body('address').notEmpty().withMessage('Address is required').trim().escape(),
    body('purposeOfVisit').notEmpty().withMessage('Purpose of visit is required').trim().escape(),
    body('stayFrom').isDate().withMessage('Invalid start date'),
    body('stayTo').isDate().withMessage('Invalid end date'),
    body('idProofNumber').notEmpty().withMessage('ID Proof is required').trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        try{
            const hotel = await Hotel.findById(req.body.hotelId);
            return res.status(400).render('guest/form', { errors: errors.array(), hotel, ...req.body }); // Re-render with errors and old input
        } catch(err){
            console.error(err);
            return res.status(500).send("Error fetching hotel");
        }
    }
    try{
        const newGuest = new Guest({
            hotelId: req.body.hotelId,
            fullName: req.body.fullName,
            mobileNumber: req.body.mobileNumber,
            address: req.body.address,
            purposeOfVisit: req.body.purposeOfVisit,
            stayFrom: req.body.stayFrom,
            stayTo: req.body.stayTo,
            email: req.body.email,
            idProofNumber: req.body.idProofNumber
        });
        await newGuest.save();
        res.render('guest/thankYou');
    } catch(err){
        console.error(err);
        return res.status(500).send("Error saving guest");
    }
});

// Handle guest edit submission
router.post('/edit/:guestId', async (req, res) => {
    try {
        await Guest.findByIdAndUpdate(req.params.guestId, req.body);
        res.redirect(`/guestAdmin/guests/${req.body.hotelId}`);
    } catch (err) { res.status(500).send(err.message); }
});

router.get('/login', (req, res) => {
    res.render('admin/login'); // Create views/admin/login.ejs
});
router.post('/login', passport.authenticate('local', {
    successRedirect: '/admin/hotels', // Redirect on successful login
    failureRedirect: '/admin/login', // Redirect back to login on failure
    failureFlash: true // Enable flash messages for login errors (requires flash middleware)
}));
router.get('/hotels', isLoggedIn, async (req, res) => {
    // ... your existing /hotels route logic
});
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/admin/login');
}
module.exports = router;
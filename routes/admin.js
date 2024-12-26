const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const QRCode = require('qrcode');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');
const passport = require('../config/passport');
const User = require('../models/user');

const storage = multer.diskStorage({
    destination: './public/uploads/', // Correct destination
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

router.get('/hotels', async (req, res) => {
    try {
        const hotels = await Hotel.find();
        res.render('admin/hotels', { hotels });
    } catch (err) { console.error(err); res.status(500).send("Error fetching hotels"); }
});

router.get('/add-hotel', (req, res) => {
    res.render('admin/addHotel');
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

router.post('/add-hotel', upload.single('logo'), async (req, res) => {
    try {
        const newHotel = new Hotel({
            name: req.body.name,
            address: req.body.address,
            logo: `/uploads/${req.file.filename}` // Correct logo path
        });

        const savedHotel = await newHotel.save();

        const qrCodeText = `http://localhost:3000/guest/form/${savedHotel._id}`;
        QRCode.toFile(`./public/qrcodes/${savedHotel._id}.png`, qrCodeText, async (err) => {
            if (err) throw err;
            savedHotel.qrCode = `/qrcodes/${savedHotel._id}.png`;
            await savedHotel.save();
            res.redirect('/admin/hotels');
        });
    } catch (err) { console.error(err); res.status(500).send("Error adding hotel"); }
});
// Logout
router.get('/logout', (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
      });
});
// Middleware to protect routes
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect('/admin/login');
}

// Protect routes that require login
router.get('/hotels', isLoggedIn, async (req, res) => {
    // ... your existing /hotels route logic
});

//Protect add hotel route
router.get('/add-hotel', isLoggedIn, (req, res) => {
    res.render('admin/addHotel');
});
router.post('/add-hotel', isLoggedIn, upload.single('logo'), async (req, res) => {
    // ... your existing /add-hotel route logic
});

// Route for registering a new user (only needed once or for admin setup)
router.get('/register', (req, res) => {
    res.render('admin/register');
});

router.post('/register', (req, res) => {
    User.register({ username: req.body.username }, req.body.password, (err, user) => {
        if (err) {
            console.error(err);
            return res.render('admin/register', { error: err.message });
        }
        passport.authenticate('local')(req, res, () => {
            res.redirect('/admin/hotels');
        });
    });
});
module.exports = router;
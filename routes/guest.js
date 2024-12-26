const express = require('express');
const router = express.Router();
const Hotel = require('../models/Hotel');
const Guest = require('../models/Guest');
const { body, validationResult } = require('express-validator');

router.get('/form/:hotelId', async (req, res) => {
    try {
        const hotel = await Hotel.findById(req.params.hotelId);
        if (!hotel) return res.status(404).send('Hotel not found');
        res.render('guest/form', { hotel });
    } catch (err) { console.error(err); res.status(500).send("Error loading form"); }
});

router.post('/submit-form', [
    body('fullName').notEmpty().withMessage('Full Name is required').trim().escape(),
    body('mobileNumber').isMobilePhone().withMessage('Invalid mobile number').trim().escape(),
    body('email').isEmail().withMessage('Invalid email address').optional({ checkFalsy: true }).trim().escape(),
    body('address').notEmpty().withMessage('Address is required').trim().escape(),
    body('purposeOfVisit').notEmpty().withMessage('Purpose of visit is required').trim().escape(),
    body('stayFrom').isDate().withMessage('Invalid start date'),
    body('stayTo').isDate().withMessage('Invalid end date'),
    body('idProofNumber').notEmpty().withMessage('ID Proof is required').trim().escape()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const hotel = await Hotel.findById(req.body.hotelId);
        return res.status(400).render('guest/form', { errors: errors.array(), hotel });
    }

    try {
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
    } catch (err){ console.error(err); res.status(500).send("Error adding hotel"); }
});

module.exports = router;
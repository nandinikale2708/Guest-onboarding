require('dotenv').config(); // Load environment variables (VERY IMPORTANT: FIRST LINE)

const express = require('express');
const path = require('path');
const adminRoutes = require('./routes/admin');
const guestRoutes = require('./routes/guest');
const guestAdminRoutes = require('./routes/guestAdmin');
const mongoose = require('mongoose');
const helmet = require('helmet');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('./config/passport');
const flash = require('connect-flash');

const app = express();
const PORT = process.env.PORT || 3001;

mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/guestOnboarding') // Use environment variable or local fallback
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Configure Sessions (BEFORE passport.initialize())
app.use(session({
    secret: process.env.SESSION_SECRET || 'YourVerySecretKey', // Use environment variable or fallback (CHANGE THIS IN PRODUCTION)
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/guestOnboarding' }) // Store sessions in MongoDB
}));

app.use(flash());

// Initialize Passport.js (AFTER session middleware)
app.use(passport.initialize());
app.use(passport.session());

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(helmet());

// Make user available in all views
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.messages = req.flash();
    next();
});

app.use('/admin', adminRoutes);
app.use('/guest', guestRoutes);
app.use('/guestAdmin', guestAdminRoutes);

app.get('/', (req, res) => {
    res.render('index');
});

//Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});


app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));
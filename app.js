if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

require('dotenv').config();
const express = require('express');
const app = express();
const ejsMate = require('ejs-mate');
const flash = require('connect-flash');
const User = require('./models/user');
const mongoose = require('mongoose');
const passport = require('passport');
const methodOverride = require('method-override');
//const bcrypt = require('bcrypt');
const session = require('express-session')
const MongoDBStore = require("connect-mongo");
const LocalStrategy = require('passport-local');
const catchAsync = require('./utils/catchAsync');
const path = require('path');
const { isLoggedIn } = require('./middleware');
const permissionsPolicy = require("permissions-policy");
const helmet = require('helmet');
const { scriptSrcUrls, styleSrcUrls, connectSrcUrls, fontSrcUrls } = require('./contentPolicyLinks')

// ROUTES
const user = require('./routes/user');
const sites = require('./routes/sites');
const reviews = require('./routes/review');

// MONGODB ATLAS
const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/campsite';
mongoose.connect(dbUrl, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => {
        console.log("Connected to mongodb")
    })
    .catch(err => {
        console.log("Error connecting to mongod")
        console.log(err)
    })

const secret = process.env.SECRET || 'bIlKPnuBwYddk45bzxrAQQweC1kaipoajqlLj7qy';

const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
});


// Create collection 'session' on mongo atlas
const sessionConfig = {
    store,
    name: 'session',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60,
        maxAge: 1000 * 60 * 60 // milliseconds seconds minutes days weeks
    }
}

app.use(session(sessionConfig));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(helmet({ crossOriginEmbedderPolicy: false }));

app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); // CORS in helmet

app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: ["'none'"],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dvxvgwx9m/",
                "https://images.unsplash.com/"
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
            frameAncestors: ["'none'"]
        }
    })
);

app.use(
    helmet.frameguard({
        action: "deny",
    })
);

app.use(
    permissionsPolicy({
        features: {
            fullscreen: ["self"], // fullscreen=()
            //vibrate: ["none"], // vibrate=(none)
            accelerometer: ["self"],
            //ambientLigntSensor: ["none"],
            autoplay: ["self"],
            //battery: ["none"],
            camera: ["self"],
            geolocation: ["self"],
            gyroscope: ["self"],
            //layoutAnimations: ["self"],
            microphone: ["self"],
            //oversizedImages: ["none"],
            payment: ["self"],
            //speakerSelection: ["none"],
            webShare: ["self"],
            syncXhr: ["self"]
        },
    })
);

// Executed every time the app receives a request
app.use((req, res, next) => {
    console.log(req.session)
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

// EXPRESS
app.engine('ejs', ejsMate)
app.set('view engine', 'ejs');
app.use(methodOverride('_method'));
app.set('views', path.join(__dirname, 'views'));

// STATIC FILES (for serving css, images, and JS files)
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'css')))
app.use(express.static(path.join(__dirname, 'assets')))
app.use(express.static(path.join(__dirname, 'utils')))
app.use(express.static(path.join(__dirname, 'public')))

app.use(express.urlencoded({ extended: true }));

// ROUTING
app.use('/user', user)
app.use('/sites', sites)
app.use('/sites/:id/reviews', reviews)

app.get('/', (async(req, res) => {
    if (req.isAuthenticated()) {
        req.session.returnTo = req.originalUrl
        res.redirect('user/home');
    } else {
        res.render('initial');
    }
}));

app.get('/about', (req, res) => {
    res.render('about')
})

app.get('/contact', (req, res) => {
    res.render('contact')
})

app.all('*', (req, res) => {
    res.send("Page unavailble")
})

const port = process.env.PORT || 3000; // if first does not work, try the second
app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})

//msUmz38PI9crSPZh
//enigmatic-cove-37838
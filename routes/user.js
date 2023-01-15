const express = require('express');
const app = express();
const router = express.Router();
const passport = require('passport');
const { authenticate } = require('passport');
const User = require('../models/user');
const users = require('../controllers/user');
const { isLoggedIn, passAuthenticate, validateUser } = require('../middleware');
const catchAsync = require('../utils/catchAsync');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

router.get('/initial', (req, res) => {
    res.render('initial');
})

router.get('/home', isLoggedIn, users.home)

router.route('/register')
    .get(users.renderRegister)
    .post(upload.single('image'), catchAsync(users.register));

router.route('/login')
    .get(users.renderLogin)
    .post(passport.authenticate('local', { failureFlash: true, failureRedirect: '../user/login' }), users.login)

router.get('/logout', users.logout)

router.get('/verify', users.verify);

router.route('/forgotpassword')
    .get(users.forgotPassword)
    .post(users.forgotPassEmail)

router.get('/resetpassword/:userID/:token', users.changePasswordPage)

router.post('/resetpassword/:userID/:token', users.changePassword)

router.route('/account')
    .get(isLoggedIn, users.renderAccount)
    .post(isLoggedIn, upload.single('image'), catchAsync(users.updateAccount));

module.exports = router;
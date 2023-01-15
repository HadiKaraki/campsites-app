const User = require('../models/user');
const Site = require('../models/sites');
const flash = require('connect-flash');
var nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { cloudinary } = require("../cloudinary");

module.exports.home = async(req, res) => {
    const id = req.user._id
    const sites = await Site.find({ author: id })
    req.session.returnTo = req.originalUrl
    req.flash('success', 'welcome back!');
    res.render('user/home', { sites });
}

module.exports.renderAccount = async(req, res) => {
    res.render('user/account')
}

module.exports.verify = async(req, res) => {
    const username = req.query.username;
    const phone_nb = req.query.phone_nb;
    const email = req.query.email;
    const checkUsername = await User.findOne({ username });
    const checkPhone = await User.findOne({ phone_nb });
    const checkEmail = await User.findOne({ email });
    // For updating account or registering a new one
    if (req.isAuthenticated()) {
        if (checkUsername && username != req.user.username) {
            res.send("username");
        } else if (checkPhone && phone_nb != req.user.phone_nb) {
            res.send("phone_nb");
        } else if (checkEmail && email != req.user.email) {
            res.send("email");
        } else {
            res.send("false");
        }
    } else {
        if (checkUsername) {
            res.send("username");
        } else if (checkPhone) {
            res.send("phone_nb");
        } else if (checkEmail) {
            res.send("email");
        } else {
            res.send("false");
        }
    }
}

module.exports.updateAccount = async(req, res) => {
    const { deleteProfile } = req.body;
    const userID = req.user._id;
    const user = await User.findByIdAndUpdate(userID, {...req.body.user });
    if (req.file) {
        user.profile = {
            url: req.file.path,
            filename: req.file.filename
        };
    }
    if (req.body.deleteProfile) {
        await cloudinary.uploader.destroy(deleteProfile);
        //await User.findByIdAndUpdate(userID, { $pull: { following: user._id } });
        user.profile.url = '';
        user.profile.filename = '';
    }
    await user.save();
    req.flash('success', 'Successfully updated account!');
    res.redirect('../user/home');
}

module.exports.renderRegister = (req, res) => {
    res.render('user/register');
}

module.exports.register = async(req, res) => {
    try {
        const { password } = req.body;
        const user = new User(req.body.user);
        user.password = password;
        if (req.file) {
            user.profile = {
                url: req.file.path,
                filename: req.file.filename
            };
        } else {
            user.profile = {
                url: '',
                filename: ''
            }
        }
        const registeredUser = await User.register(user, password);
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', 'Welcome!');
            res.redirect('../user/home');
        })
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('../user/register');
    }
}

module.exports.renderLogin = async(req, res) => {
    res.render('user/login');
}

module.exports.login = async(req, res) => {
    req.flash('success', 'welcome back!');
    res.redirect('../user/home');
}


module.exports.logout = (req, res, next) => {
    req.logout(function(err) {
        if (err) { return next(err); }
        res.redirect('/');
    });
    req.flash('success', "Goodbye!");
    res.redirect('/');
}

module.exports.forgotPassword = async(req, res) => {
    res.render('user/forgot_password');
}

module.exports.forgotPassEmail = async(req, res) => {
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    if (!user) {
        res.send("signup");
        return;
    }
    payload = {
        id: user._id,
        email: email
    };
    secret = uuidv4();
    var token = jwt.sign(payload, secret, { expiresIn: '1h' })
    const output = `<p>A password reset was requested on this account. Click on 
                        <a href="http://localhost:3000/user/resetpassword/${user._id}/${token}">
                            this
                        </a>
                        link in order to reset your password. This link expires in 1 hour.
                    </p>`
    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'hadikaraki373@gmail.com',
            pass: 'vztvzljysxeckygd'
        }
    });

    // setup email data with unicode symbols
    let mailOptions = {
        from: '"PAYF" hadikaraki373@gmail.com', // sender address
        to: email, // list of receivers
        subject: 'Password reset request', // Subject line
        text: '', // plain text body
        html: output // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('Message sent: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    });
    res.send('found');
}

module.exports.changePasswordPage = async(req, res) => {
    const token = req.params.token;
    jwt.verify(req.params.token, secret, (err, authData) => {
        if (err) {
            res.send("Wrong or expired link");
        } else {
            const userID = req.params.userID;
            res.render('user/reset_password', { userID, token });
        }
    });
}

module.exports.changePassword = async(req, res) => {
    jwt.verify(req.params.token, secret, async(err, authData) => {
        if (err) {
            res.send("Wrong or expired link");
        } else {
            const { userID } = req.params
            const user = await User.findById(userID);
            const { newPassword } = req.body;
            user.setPassword(newPassword, function() {
                user.save();
                req.flash('success', 'Succesfuly changed password!')
                res.redirect('/user/login');
            });
            secret = uuidv4();
        }
    });
}
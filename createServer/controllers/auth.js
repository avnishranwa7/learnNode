require('dotenv').config();

const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

const User = require('../models/user');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
        clientId: process.env.OAUTH_CLIENT_ID,
        clientSecret: process.env.OAUTH_CLIENT_SECRET,
        refreshToken: process.env.OAUTH_REFRESH_TOKEN
    }
});

exports.getLogin = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    res.render('auth/login', { pageTitle: 'Login', errorMessage: message });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }

    res.render('auth/signup', { pageTitle: 'Signup', errorMessage: message });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    User.findOne({ email })
        .then(user => {
            if (!user) {
                req.flash('error', 'Invalid email or password');
                return res.redirect('/login');
            }

            bcrypt.compare(password, user.password)
                .then(doMatch => {
                    if (doMatch) {
                        req.session.isLoggedIn = true;
                        req.session.user = user;
                        return req.session.save(err => {
                            if (err) {
                                console.log(err);
                            }
                            res.redirect('/');
                        });
                    }

                    req.flash('error', 'Invalid email or password');
                    return res.redirect('/login');
                })
                .catch(err => {
                    console.log(err);
                    res.redirect('/login');
                })
        })
        .catch(err => {
            console.log(err);
        })
};

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        }

        res.redirect('/');
    })
};

exports.postSignup = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    const confirmPassword = req.body.confirmPassword;

    User.findOne({ email })
        .then(userDoc => {
            if (userDoc) {
                req.flash('error', 'Email already exists');
                return res.redirect('/signup');
            }
            return bcrypt.hash(password, 12)
                .then(hashedPassword => {
                    const user = new User({ email, password: hashedPassword, cart: { items: [] } });
                    return user.save();
                })
        })
        .then(() => {
            const mailDetails = {
                from: 'avnishranwa7@gmail.com',
                to: email,
                subject: 'Signup successfull',
                text: "You've successfully signed up at Nodejs application"
            };
            return transporter.sendMail(mailDetails)
            .then(result=>{
                console.log(result);
                res.redirect('/login');
            })
        })
        .catch(err => console.log(err));
};
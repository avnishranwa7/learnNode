require('dotenv').config();

const crypto = require('crypto');
const { validationResult } = require('express-validator');

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
    res.render('auth/login', 
    { 
        pageTitle: 'Login', 
        errorMessage: message,
        oldInput: {},
        validationErrors: []
     });
};

exports.getSignup = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }

    res.render('auth/signup',
        {
            pageTitle: 'Signup', 
            errorMessage: message,
            oldInput: {email: '', password: '', confirmPassword: ''},
            validationErrors: []
        });
};

exports.postLogin = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/login', 
        { 
            pageTitle: 'Login', 
            errorMessage: errors.array()[0].msg,
            oldInput: { email, password },
            validationErrors: errors.array()
        });
    }

    User.findOne({ email })
        .then(user => {
            if (!user) {
                return res.status(422).render('auth/login', 
                { 
                    pageTitle: 'Login', 
                    errorMessage: 'Invalid email/password',
                    oldInput: { email, password },
                    validationErrors: []
                });
            }
            return bcrypt.compare(password, user.password)
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

                    return res.status(422).render('auth/login', 
                    { 
                        pageTitle: 'Login', 
                        errorMessage: 'Invalid email/password',
                        oldInput: { email, password },
                        validationErrors: []
                    });
                })
        })
        .catch(err => {
            console.log(err);
            res.redirect('/login');
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

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup',
            {
                pageTitle: 'Signup',
                errorMessage: errors.array()[0].msg,
                oldInput: { email, password, confirmPassword: req.body.confirmPassword },
                validationErrors: errors.array()
            });
    }

    bcrypt.hash(password, 12)
        .then(hashedPassword => {
            const user = new User({ email, password: hashedPassword, cart: { items: [] } });
            return user.save();
        })
        .then(() => {
            res.redirect('/login');
            const mailDetails = {
                from: 'avnishranwa7@gmail.com',
                to: email,
                subject: 'Signup successfull',
                text: "You've successfully signed up at Nodejs application"
            };
            return transporter.sendMail(mailDetails)
                .then(result => {
                    console.log(result);
                })
        })
        .catch(err=>{
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getReset = (req, res, next) => {
    let message = req.flash('error');
    if (message.length > 0) {
        message = message[0];
    }
    else {
        message = null;
    }
    res.render('auth/reset', { pageTitle: 'Reset Password', errorMessage: message });
}

exports.postReset = (req, res, next) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect('/reset');
        }

        const token = buffer.toString('hex');
        User.findOne({ email: req.body.email })
            .then(user => {
                if (!user) {
                    req.flash('error', 'No account with that email found');
                    return res.redirect('/reset');
                }

                user.resetToken = token;
                user.resetTokenExpiration = Date.now() + 3600000;
                return user.save();
            })
            .then(() => {
                res.redirect('/');
                const mailDetails = {
                    from: 'avnishranwa7@gmail.com',
                    to: req.body.email,
                    subject: 'Password reset',
                    html: `<p>You requested a password reset.</p>
                <p>Click this <a href='http://localhost:3000/reset/${token}'>link</a> to set a new password.</p>`
                };
                return transporter.sendMail(mailDetails)
                    .then(result => {
                        console.log(result);
                    })
            })
            .catch(err=>{
                const error = new Error(err);
                error.httpStatusCode = 500;
                next(error);
            });
    })
}

exports.getNewPassword = (req, res, next) => {
    const resetToken = req.params.token;
    User.findOne({ resetToken, resetTokenExpiration: { $gt: Date.now() } })
        .then(user => {
            let message = req.flash('error');
            if (message.length > 0) {
                message = message[0];
            }
            else {
                message = null;
            }
            res.render('auth/new-password', {
                pageTitle: 'New Password',
                errorMessage: message,
                userId: user._id.toString(),
                passwordToken: resetToken
            });
        })
        .catch(err=>{
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });

}

exports.postNewPassword = (req, res, next) => {
    const newPassword = req.body.password;
    const userId = req.body.userId;
    const passwordToken = req.body.passwordToken;
    let resetUser;

    User.findOne({ resetToken: passwordToken, resetTokenExpiration: { $gt: Date.now() }, _id: userId })
        .then(user => {
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then(hashedPassword => {
            resetUser.password = hashedPassword;
            resetUser.resetToken = undefined;
            resetUser.resetTokenExpiration = undefined;
            return resetUser.save();
        })
        .then(() => {
            res.redirect('/login');
        })
        .catch(err=>{
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
}
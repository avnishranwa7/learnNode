const express = require('express');
const { check } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);
router.get('/signup', authController.getSignup);
router.get('/reset', authController.getReset);
router.get('/reset/:token', authController.getNewPassword);

router.post('/login',
    [
        check('email').isEmail().withMessage('Please enter a valid email address').normalizeEmail(),
        check('password', 'Please enter a password with only numbers and alphabets and contains at least 5 character')
            .isLength({ min: 5 }).isAlphanumeric().trim()
    ],
    authController.postLogin);

router.post('/logout', authController.postLogout);

router.post('/signup',
    [
        check('email').
            isEmail().withMessage('Please enter a valid email')
            .custom((value, { req }) => {
                // if(value==='test@test.com'){
                //     throw new Error('Dummy email not allowed');
                // }

                // return true;

                return User.findOne({ email: value })
                    .then(userDoc => {
                        if (userDoc) {
                            return Promise.reject('Email already exists');
                        }
                    })
            })
            .normalizeEmail(),
        check('password', 'Please enter a password with only numbers and alphabets and contains at least 5 character').
            isLength({ min: 5 }).isAlphanumeric().trim(),
        check('confirmPassword').custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Passwords does mot match');
            }

            return true;
        }).trim()
    ],
    authController.postSignup);

router.post('/reset', authController.postReset);
router.post('/new-password', authController.postNewPassword);

module.exports = router;
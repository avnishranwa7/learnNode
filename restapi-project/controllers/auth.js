const bcrypt = require('bcryptjs');
const User = require('../models/user');

const { validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');

exports.signup = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed');
        error.statusCode = 422;
        error.data = errors.array();
        throw err;
    }

    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    try{
        const hashedPassword = await bcrypt.hash(password, 12);
        const user = new User({
            email,
            password: hashedPassword,
            name
        });

        const result = await user.save();

        res.status(201).json({
            message: 'New user created',
            userId: result._id
        });
    } catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}

exports.login = async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    try{
        const user = await User.findOne({ email: email });
        if (!user) {
            const error = new Error('Email or password invalid');
            error.statusCode = 401;
            throw error;
        }

        const isEqual = await bcrypt.compare(password, user.password);
        if (!isEqual) {
            const error = new Error('Email or password invalid');
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign(
            { 
                email: user.email,
                userId: user._id.toString()
            },
            'somesupersecretsecret',
            { expiresIn: '1h' }
        );

        res.status(200).json({ token, userId: user._id.toString() });
    } catch(err){
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
}
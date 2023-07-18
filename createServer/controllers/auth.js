const User = require('../models/user');

exports.getLogin = (req, res, next)=>{
    res.render('auth/login', { pageTitle: 'Login', isAuthenticated: req.session.isLoggedIn })
};

exports.postLogin = (req, res, next)=>{
    User.findById('64b643e1c8cafe4f9f545e68')
    .then(user => {
        req.session.isLoggedIn = true;
        req.session.user = user;
        req.session.save(err=>{
            console.log(err);
            res.redirect('/');
        });
        
    })
    .catch(err => {
        console.log(err);
    })
};

exports.postLogout = (req, res, next)=>{
    req.session.destroy(err=>{
        console.log(err);
        res.redirect('/')
    })
};
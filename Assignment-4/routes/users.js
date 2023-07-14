const express = require('express');

const router = express.Router();

const homepageData = require('./homepage');

router.get('/users', (req, res, next)=>{
    res.render('users', { pageTitle: 'Users', users: homepageData.users });
});

module.exports = router;
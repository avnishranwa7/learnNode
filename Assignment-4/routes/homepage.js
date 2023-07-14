const express = require('express');

const router = express.Router();

const users = [];

router.get('/', (req, res, next)=>{
    res.render('homepage', { pageTitle: 'HomePage' });
});

router.post('/add-user', (req, res, next)=>{
    const name = req.body.name;
    users.push({name});
    res.redirect('/');
});

module.exports = {
    router,
    users
}
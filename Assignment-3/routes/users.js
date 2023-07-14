const express = require('express');
const path = require('path');

const router = express.Router();

const rootDir = require('../util/path');

router.get('/users', (req, res, next)=>{
    res.sendFile(path.join(rootDir, 'views', 'users.html'));
});

module.exports = router;
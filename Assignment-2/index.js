const express = require('express');

const app = express();

app.use('/favicon.ico', (req, res)=>{
    res.status(204).end();
})

app.use('/users', (req, res, next)=>{
    console.log('This is users page');
    res.send('Users page');
});

app.use('/', (req, res, next)=>{
    console.log('This is home page');
    res.send('Home page');
});

app.listen(3000);
const express = require('express');
const path = require('path');

const homeRouter = require('./routes/home');
const userRouter = require('./routes/users');
const rootDir = require('./util/path');

const app = express();
app.use(express.static(path.join(rootDir, 'public')));

app.use(userRouter);
app.use(homeRouter);

app.use('/', (req, res, next)=>{
    res.sendFile(path.join(rootDir, 'views', '404.html'));
});

app.listen(3000);
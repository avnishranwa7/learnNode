const express = require('express');
const bodyParser = require('body-parser');

const homepageData = require('./routes/homepage');
const userRouter = require('./routes/users');

const app = express();
app.use(bodyParser.urlencoded({extended: false}));

app.set('view engine', 'ejs');

app.use(homepageData.router);
app.use(userRouter);

app.listen(3000);
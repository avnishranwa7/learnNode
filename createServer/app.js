const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const rootDir = require('./util/path');
const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(rootDir, 'public')));

app.get('/favicon.ico', (req, res, next) => {
    res.status(204).end();
});

app.use((req, res, next) => {
    User.findById('64b643e1c8cafe4f9f545e68')
    .then(user => {
        req.user = user;
        next();
    })
    .catch(err => {
        console.log(err);
    })
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

mongoose.connect('mongodb+srv://avnishranwa7:0XLcbnT14MhInnc7@cluster0.7vw33kc.mongodb.net/shop?retryWrites=true&w=majority')
.then(()=>{
    User.findOne()
    .then(user=>{
        if(!user){
            const user = new User({
                name: 'Avnish',
                email: 'avnish@test.com',
                cart: {
                    items: []
                }
            });
            user.save();
        }
    })
    app.listen(3000);
})
.catch(err=>console.log(err));
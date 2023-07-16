const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const rootDir = require('./util/path');
const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cartItem');
const Order = require('./models/order');
const OrderItem = require('./models/orderItem');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(rootDir, 'public')));

app.get('/favicon.ico', (req, res, next) => {
    res.status(204).end();
});

app.use((req, res, next) => {
    User.findByPk(1)
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

Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product);
Cart.belongsTo(User);
User.hasOne(Cart);
Product.belongsToMany(Cart, { through: CartItem });
Cart.belongsToMany(Product, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Product, { through: OrderItem });
Product.belongsToMany(Order, { through: OrderItem });

sequelize
// .sync({ force: true })
.sync()
.then(() => {
    const user = User.findByPk(1);
    return user;
})
    .then(user => {
        if (!user) {
            return User.create({ name: 'Avnish', email: 'test@test.com' });
        }
        return user;
    })
    .then(user => {
        user.getCart()
        .then(cart=>{
            if(!cart){
                user.createCart();
            }
        })
        .catch(err=>console.log(err));
    })
    .then(()=>{
        app.listen(3000);
    })
    .catch(err => {
        console.log(err);
    })
const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/product-list', { prods: products, pageTitle: 'Products' });
        })
        .catch(err => console.log(err));
};

exports.getProduct = (req, res, next) => {
    const productID = req.params.productID;
    Product.findById(productID)
        .then(product => {
            res.render('shop/product-detail', { product, pageTitle: product.title });
        })
        .catch(err => console.log(err));
};

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items;
            res.render('shop/cart', { pageTitle: 'Cart', products });
        })
        .catch(err => console.log(err));
};

exports.postCart = (req, res, next) => {
    const productID = req.body.productID;

    Product.findById(productID)
        .then(product => {
            return req.user.addToCart(product);
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
};

exports.deleteCartItem = (req, res, next) => {
    const productID = req.body.productId;
    req.user.deleteCartItem(productID)
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => console.log(err));
};

exports.getIndex = (req, res, next) => {
    res.render('shop/index', { pageTitle: 'Shop' });
};

// exports.getCheckout = (req, res, next)=>{
//     res.render('shop/checkout', { pageTitle: 'Checkout' });
// };

exports.getOrders = (req, res, next) => {
    Order.find({ 'user.userId': req.user._id })
        .then(orders => {
            res.render('shop/orders', { pageTitle: 'Orders', orders });
        })
        .catch(err => console.log(err));
};

exports.postOrders = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items.map(item => {
                return { quantity: item.quantity, product: { ...item.productId._doc } };
            });
            const order = new Order({
                user: {
                    email: req.user.email,
                    userId: req.user
                },
                products
            });
            return order.save();
        })
        .then(() => {
            req.user.clearCart()
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch(err => console.log(err));
}
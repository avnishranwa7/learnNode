const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');

const rootDir = require('../util/path');
const Product = require('../models/product');
const Order = require('../models/order');

exports.getProducts = (req, res, next) => {
    Product.find()
        .then(products => {
            res.render('shop/product-list', { prods: products, pageTitle: 'Products' });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getProduct = (req, res, next) => {
    const productID = req.params.productID;
    Product.findById(productID)
        .then(product => {
            res.render('shop/product-detail', { product, pageTitle: product.title });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getCart = (req, res, next) => {
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items;
            res.render('shop/cart', { pageTitle: 'Cart', products });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.deleteCartItem = (req, res, next) => {
    const productID = req.body.productId;
    req.user.deleteCartItem(productID)
        .then(() => {
            res.redirect('/cart');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
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
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
}

exports.getInvoice = (req, res, next) => {
    const orderId = req.params.orderId;
    Order.findById(orderId)
    .then(order=>{
        if(!order){
            return next(new Error('No order found.'));
        }

        if(order.user.userId.toString()!==req.user._id.toString()){
            return new Error('Unauthorized');
        }

        const invoiceName = 'invoice-' + orderId + '.pdf';
        const invoicePath = path.join(rootDir, 'data', 'invoices', invoiceName);

        const pdfDoc = new PDFDocument();
        pdfDoc.pipe(fs.createWriteStream(invoicePath));

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'inline; filename="' + invoiceName + '"');
        pdfDoc.pipe(res);

        pdfDoc.fontSize(26).text('Invoice', {
            underline: true
        });
        pdfDoc.text('---------------------------------');

        let totalPrice = 0;
        order.products.forEach(prod=>{
            totalPrice+=prod.quantity * prod.product.price;
            pdfDoc.fontSize(14).text(prod.product.title + ' - ' + prod.quantity + ' x ' + '$' + prod.product.price);
        })
        pdfDoc.text('---------------------------------');
        pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);
        
        pdfDoc.end();
    })
    .catch(err=>next(err));
    
}
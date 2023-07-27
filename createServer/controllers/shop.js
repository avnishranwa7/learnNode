require('dotenv').config()

const fs = require('fs');
const path = require('path');

const PDFDocument = require('pdfkit');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const rootDir = require('../util/path');
const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 2;

exports.getProducts = (req, res, next) => {
    const pageNumber = +req.query.page || 1;
    let totalProducts;

    Product.find().countDocuments()
        .then(numberOfProducts => {
            totalProducts = numberOfProducts;
            return Product.find()
                .skip((pageNumber - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then(products => {
            res.render('shop/product-list',
                {
                    prods: products,
                    pageTitle: 'Products',
                    currentPage: pageNumber,
                    hasNextPage: ITEMS_PER_PAGE * pageNumber < totalProducts,
                    hasPrevPage: pageNumber > 1,
                    nextPage: pageNumber + 1,
                    previousPage: pageNumber - 1,
                    lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE)
                });
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
    const pageNumber = +req.query.page || 1;
    let totalProducts;

    Product.find().countDocuments()
        .then(numberOfProducts => {
            totalProducts = numberOfProducts;
            return Product.find()
                .skip((pageNumber - 1) * ITEMS_PER_PAGE)
                .limit(ITEMS_PER_PAGE)
        })
        .then(products => {
            res.render('shop/index',
                {
                    prods: products,
                    pageTitle: 'Shop',
                    currentPage: pageNumber,
                    hasNextPage: ITEMS_PER_PAGE * pageNumber < totalProducts,
                    hasPrevPage: pageNumber > 1,
                    nextPage: pageNumber + 1,
                    previousPage: pageNumber - 1,
                    lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE)
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getCheckout = (req, res, next) => {
    let productsList;
    let totalSum = 0;
    req.user
        .populate('cart.items.productId')
        .then(user => {
            const products = user.cart.items;
            productsList = products;
            products.forEach(product => {
                totalSum += product.quantity * product.productId.price;
            })

            return stripe.checkout.sessions.create({
                mode: 'payment',
                payment_method_types: ['card'],
                line_items: products.map(p => {
                    return {
                        price_data: {
                            currency: 'usd',
                            product_data: {
                                name: p.productId.title,
                                description: p.productId.description,
                            },
                            unit_amount: p.productId.price * 100,
                        },
                        quantity: p.quantity
                    };
                }),
                success_url: req.protocol + '://' + req.get('host') + '/checkout/success',
                cancel_url: req.protocol + '://' + req.get('host') + '/checkout/cancel'
            });
        })
        .then(session => {
            return res.render('shop/checkout',
                {
                    pageTitle: 'Checkout',
                    products: productsList,
                    totalSum,
                    sessionId: session.id,
                    stripeKey: process.env.STRIPE_KEY
                });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

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

exports.getCheckoutSuccess = (req, res, next) => {
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
            return req.user.clearCart()
        })
        .then(() => {
            return res.redirect('/orders');
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
        .then(order => {
            if (!order) {
                return next(new Error('No order found.'));
            }

            if (order.user.userId.toString() !== req.user._id.toString()) {
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
            order.products.forEach(prod => {
                totalPrice += prod.quantity * prod.product.price;
                pdfDoc.fontSize(14).text(prod.product.title + ' - ' + prod.quantity + ' x ' + '$' + prod.product.price);
            })
            pdfDoc.text('---------------------------------');
            pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

            pdfDoc.end();
        })
        .catch(err => next(err));

}
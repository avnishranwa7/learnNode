const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next)=>{
    Product.fetchAll((products)=>{
        res.render('shop/product-list', {prods: products, pageTitle: 'Products'});
    });
};

exports.getProduct = (req, res, next)=>{
    const productID = req.params.productID;
    Product.findByID(productID, product=>{
        res.render('shop/product-detail', { product, pageTitle: product.title });
    })
};

exports.getCart = (req, res, next)=>{
    Cart.getCart(cart=>{
        Product.fetchAll(products => {
            let cartProducts = [];
            for(let product of products){
                const cartProductData = cart.products.find(prod => prod.id===product.id);
                if(cartProductData){
                    cartProducts.push({ product, qty: cartProductData.qty });
                }
            }
            res.render('shop/cart', { pageTitle: 'Cart', productData: cartProducts });
        });
    });
};

exports.postCart = (req, res, next)=>{
    const productID = req.body.productID;
    Product.findByID(productID, (product)=>{
        Cart.addProduct(productID, product.price);
    });
    res.redirect('/cart');
};

exports.deleteCartItem = (req, res, next)=>{
    const productID = req.body.productId;
    Product.findByID(productID, (product)=>{
        Cart.deleteProduct(productID, product.price, ()=>{
            res.redirect('/cart');
        })
    });
};

exports.getIndex = (req, res, next)=>{
    res.render('shop/index', { pageTitle: 'Shop' });
};

exports.getCheckout = (req, res, next)=>{
    res.render('shop/checkout', { pageTitle: 'Checkout' });
};

exports.getOrders = (req, res, next)=>{
    res.render('shop/orders', { pageTitle: 'Orders' });
};
const Product = require('../models/product');

exports.getProducts = (req, res, next)=>{
    Product.fetchAll()
    .then(products=>{
        res.render('shop/product-list', {prods: products, pageTitle: 'Products'});
    })
    .catch(err=>console.log(err));
};

exports.getProduct = (req, res, next)=>{
    const productID = req.params.productID;
    Product.findById(productID)
    .then(product=>{
        res.render('shop/product-detail', { product, pageTitle: product.title });
    })
    .catch(err=>console.log(err));
};

exports.getCart = (req, res, next)=>{
    req.user.getCart()
    .then(products=>{
        res.render('shop/cart', { pageTitle: 'Cart', products });
    })
    .catch(err=>console.log(err));
};

exports.postCart = (req, res, next)=>{
    const productID = req.body.productID;

    Product.findById(productID)
    .then(product=>{
        return req.user.addToCart(product)
    })
    .then(()=>{
        res.redirect('/cart');
    })
    .catch(err=>console.log(err));
};

exports.deleteCartItem = (req, res, next)=>{
    const productID = req.body.productId;
    req.user.deleteCartItem(productID)
    .then(()=>{
        res.redirect('/cart');
    })
    .catch(err=>console.log(err));
};

exports.getIndex = (req, res, next)=>{
    res.render('shop/index', { pageTitle: 'Shop' });
};

// exports.getCheckout = (req, res, next)=>{
//     res.render('shop/checkout', { pageTitle: 'Checkout' });
// };

exports.getOrders = (req, res, next)=>{
    req.user.getOrders()
    .then(orders=>{
        res.render('shop/orders', { pageTitle: 'Orders', orders });
    })
    .catch(err=>console.log(err));
};

exports.postOrders = (req, res, next)=>{
    req.user.addOrder()
    .then(()=>{
        res.redirect('/orders');
    })
    .catch(err=>console.log(err));
}
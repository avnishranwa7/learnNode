const Product = require('../models/product');

exports.getProducts = (req, res, next)=>{
    Product.findAll()
    .then(product=>{
        res.render('shop/product-list', {prods: product, pageTitle: 'Products'});
    })
    .catch(err=>{
        console.log(err);
    })
};

exports.getProduct = (req, res, next)=>{
    const productID = req.params.productID;
    Product.findByPk(productID)
    .then(product=>{
        res.render('shop/product-detail', { product, pageTitle: product.title });
    })
    .catch(err=>{
        console.log(err);
    });
};

exports.getCart = (req, res, next)=>{
    req.user.getCart()
    .then(cart=>{
        return cart.getProducts();
    })
    .then(products=>{
        console.log(products);
        res.render('shop/cart', { pageTitle: 'Cart', products });
    })
    .catch(err=>console.log(err));
    // Cart.getCart(cart=>{
    //     Product.fetchAll(products => {
    //         let cartProducts = [];
    //         for(let product of products){
    //             const cartProductData = cart.products.find(prod => prod.id===product.id);
    //             if(cartProductData){
    //                 cartProducts.push({ product, qty: cartProductData.qty });
    //             }
    //         }
    //         res.render('shop/cart', { pageTitle: 'Cart', productData: cartProducts });
    //     });
    // });
};

exports.postCart = (req, res, next)=>{
    const productID = req.body.productID;
    let fetchedCart;
    let quantity = 1;
    req.user.getCart()
    .then(cart=>{
        fetchedCart = cart;
        return cart.getProducts({ where: { id: productID } });
    })
    .then(products=>{
        let product;
        if(products.length>0){
            product = products[0];
        }
        if(product){
            quantity += product.cartItem.quantity;
            return product;
        }

        return Product.findByPk(productID)
    })
    .then(product=>{
        return fetchedCart.addProduct(product, { through: { quantity: quantity } });
    })
    .then(()=>{
        res.redirect('/cart');
    })
    .catch(err=>console.log(err));
};

exports.deleteCartItem = (req, res, next)=>{
    const productID = req.body.productId;
    req.user.getCart()
    .then(cart=>{
        return cart.getProducts({ where: { id: productID } });
    })
    .then(products=>{
        const product = products[0];
        return product.cartItem.destroy();
    })
    .then(()=>{
        res.redirect('/cart');
    })
    .catch(err=>console.log(err));
};

exports.getIndex = (req, res, next)=>{
    res.render('shop/index', { pageTitle: 'Shop' });
};

exports.getCheckout = (req, res, next)=>{
    res.render('shop/checkout', { pageTitle: 'Checkout' });
};

exports.getOrders = (req, res, next)=>{
    req.user.getOrders({ include: ['products'] })
    .then(orders=>{
        res.render('shop/orders', { pageTitle: 'Orders', orders });
    })
    .catch(err=>console.log(err));
};

exports.postOrders = (req, res, next)=>{
    let fetchedCart;
    req.user.getCart()
    .then(cart=>{
        fetchedCart = cart;
        return cart.getProducts();
    })
    .then(products=>{
        return req.user.createOrder()
        .then(order=>{
            return order.addProducts(
                products.map(product=>{
                    product.orderItem = { quantity: product.cartItem.quantity };
                    return product;
                })
            );
        })
        .catch(err=>console.log(err));
    })
    .then(()=>{
        return fetchedCart.setProducts(null);
    })
    .then(()=>{
        res.redirect('/orders');
    })
    .catch(err=>console.log(err));
}
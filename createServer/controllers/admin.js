const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    res.render('admin/edit-product', { pageTitle: 'Add Product', editing: false, isAuthenticated: req.session.isLoggedIn });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;

    const product = new Product({ userId: req.user, title, price, imageUrl, description });

    product.save()
        .then(() => {
            res.redirect('/products');
        })
        .catch(err => {
            console.log(err);
        });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    const productID = req.params.productID;
    if (editMode !== "true") {
        return res.redirect('/');
    }
    Product.findById(productID)
        .then(product => {
            if (!product) {
                return res.redirect('/');
            }
            res.render('admin/edit-product', { product, pageTitle: 'Add Product', pageTitle: 'Edit Product', editing: editMode, isAuthenticated: req.session.isLoggedIn });
        })
        .catch(err => {
            console.log(err);
        });
};

exports.postEditProduct = (req, res, next) => {
    const productID = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;

    Product.findById(productID)
        .then(product => {
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.imageUrl = updatedImageUrl;
            product.description = updatedDescription;

            return product.save();
        })
        .then(() => {
            res.redirect('/products');
        })
        .catch(err => console.log(err));
};

exports.postDeleteProduct = (req, res, next) => {
    const productID = req.body.productId;
    Product.findByIdAndRemove(productID)
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err => console.log(err));
};

exports.getAdminProducts = (req, res, next) => {
    if (!req.session.isLoggedIn) {
        return res.redirect('/login');
    }
    Product.find()
        //  .select('title price -_id)  only passes title, price in each product, _id is automatically included,
        //  so -_id removes that
        //  .populate('userId', 'name')   populates userId field with not just userId but the entire user object with
        //  that userId, second parameter works like select, so user object with just name, and _id is automatically
        //  added
        .then(products => {
            res.render('admin/products', { pageTitle: 'Admin Products', prods: products, isAuthenticated: req.session.isLoggedIn });
        })
        .catch(err => {
            console.log(err);
        });
};
const { validationResult } = require('express-validator');

const Product = require('../models/product');
const { trusted } = require('mongoose');

exports.getAddProduct = (req, res, next) => {
    res.render('admin/edit-product', 
    { pageTitle: 'Add Product', editing: false, hasError: false, errorMessage: null, validationErrors: [] });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-product', 
        {   product: {
                title,
                imageUrl, 
                price, 
                description
            }, 
            pageTitle: 'Add Product', 
            editing: false,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    const product = new Product({ userId: req.user, title, price, imageUrl, description });

    product.save()
        .then(() => {
            res.redirect('/products');
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
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
            res.render('admin/edit-product', 
            { product, pageTitle: 'Edit Product', editing: editMode, hasError: false, errorMessage: null, validationErrors: [] });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.postEditProduct = (req, res, next) => {
    const productID = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;

    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(422).render('admin/edit-product', 
        {   product: {
                title: updatedTitle,
                imageUrl: updatedImageUrl, 
                price: updatedPrice, 
                description: updatedDescription,
                _id: productID
            }, 
            pageTitle: 'Add Product', 
            editing: true,
            hasError: true,
            errorMessage: errors.array()[0].msg,
            validationErrors: errors.array()
        });
    }

    Product.findById(productID)
        .then(product => {
            if(product.userId.toString() !== req.user._id.toString()){
                return res.redirect('/');
            }
            product.title = updatedTitle;
            product.price = updatedPrice;
            product.imageUrl = updatedImageUrl;
            product.description = updatedDescription;

            return product.save()
            .then(() => {
                res.redirect('/products');
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.postDeleteProduct = (req, res, next) => {
    const productID = req.body.productId;
    Product.deleteOne({_id: productID, userId: req.user._id})
        .then(() => {
            res.redirect('/admin/products');
        })
        .catch(err=>{
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};

exports.getAdminProducts = (req, res, next) => {
    Product.find({userId: req.user._id})
        //  .select('title price -_id)  only passes title, price in each product, _id is automatically included,
        //  so -_id removes that
        //  .populate('userId', 'name')   populates userId field with not just userId but the entire user object with
        //  that userId, second parameter works like select, so user object with just name, and _id is automatically
        //  added
        .then(products => {
            res.render('admin/products', { pageTitle: 'Admin Products', prods: products });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        });
};
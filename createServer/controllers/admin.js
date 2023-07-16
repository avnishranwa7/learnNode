const Product = require('../models/product');

exports.getAddProduct = (req, res, next)=>{
    res.render('admin/edit-product', { pageTitle: 'Add Product', editing: false });
};

exports.postAddProduct = (req, res, next)=>{
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    
    req.user.createProduct({title, imageUrl, price, description})
    .then(()=>{
        res.redirect('/products');
    })
    .catch(err=>{
        console.log(err);
    });
};

exports.getEditProduct = (req, res, next)=>{
    const editMode = req.query.edit;
    const productID = req.params.productID;
    if(editMode!=="true"){
        return res.redirect('/');
    }
    Product.findByPk(productID)
    .then(product=>{
        if(product.length===0){
            return res.redirect('/');
        }
        res.render('admin/edit-product', { product, pageTitle: 'Add Product', pageTitle: 'Edit Product', editing: editMode });
    })
    .catch(err=>{
        console.log(err);
    });    
};

exports.postEditProduct = (req, res, next)=>{
    const productID = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedImageUrl = req.body.imageUrl;
    const updatedPrice = req.body.price;
    const updatedDescription = req.body.description;
    
    Product.findByPk(productID)
    .then(product=>{
        product.title = updatedTitle;
        product.price = updatedPrice;
        product.imageUrl = updatedImageUrl;
        product.description = updatedDescription;
        product.save();
    })
    .then(()=>{
        res.redirect('/products');
    })
    .catch(err=>console.log(err));
};

exports.postDeleteProduct = (req, res, next)=>{
    const productID = req.body.productId;
    Product.findByPk(productID)
    .then(product=>{
        product.destroy();
    })
    .then(()=>{
        res.redirect('/products');
    })
    .catch(err=>console.log(err));
};

exports.getAdminProducts = (req, res, next)=>{
    req.user.getProducts()
    .then(products=>{
        res.render('admin/products', { pageTitle: 'Admin Products', prods: products});
    })
    .catch(err=>{
        console.log(err);
    });
};
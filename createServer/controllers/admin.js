const Product = require('../models/product');

exports.getAddProduct = (req, res, next)=>{
    res.render('admin/edit-product', { pageTitle: 'Add Product', editing: false });
};

exports.postAddProduct = (req, res, next)=>{
    const title = req.body.title;
    const imageUrl = req.body.imageUrl;
    const price = req.body.price;
    const description = req.body.description;
    
    const product = new Product(null, title, price, imageUrl, description);
    
    product.save()
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
    Product.findById(productID)
    .then(product=>{
        if(!product){
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

    const updatedProduct = new Product(productID, updatedTitle, updatedPrice, updatedImageUrl, updatedDescription);
    
    updatedProduct.save()
    .then(()=>{
        res.redirect('/products');
    })
    .catch(err=>console.log(err));
};

exports.postDeleteProduct = (req, res, next)=>{
    const productID = req.body.productId;
    Product.deleteById(productID)
    .then(()=>{
        res.redirect('/admin/products');
    })
    .catch(err=>console.log(err));
};

exports.getAdminProducts = (req, res, next)=>{
    Product.fetchAll()
    .then(products=>{
        res.render('admin/products', { pageTitle: 'Admin Products', prods: products});
    })
    .catch(err=>{
        console.log(err);
    });
};
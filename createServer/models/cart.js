const fs = require('fs');
const path = require('path');

const rootDir = require('../util/path');

const filePath = path.join(rootDir, 'data', 'cart.json');

module.exports = class Cart {
    static addProduct(id, productPrice) {
        //Fetch the previous cart
        fs.readFile(filePath, (err, fileContent)=>{
            let cart = {products: [], totalPrice: 0};
            if(!err){
                cart = JSON.parse(fileContent);
            }

            // Analyze the cart => Find existing product
            const existingProductIndex = cart.products.findIndex(prod => prod.id===id);
            const existingProduct = cart.products[existingProductIndex];
            let updatedProduct;

            // Add new product/increase quantity
            if(existingProduct){
                updatedProduct = {...existingProduct};
                updatedProduct.qty = updatedProduct.qty + 1;
                cart.products[existingProductIndex] = updatedProduct;
            }
            else{
                updatedProduct = {id, qty: 1};
                cart.products = [...cart.products, updatedProduct];
            }

            cart.totalPrice = cart.totalPrice + +productPrice;
            fs.writeFile(filePath, JSON.stringify(cart), (err)=>{
                if(err){
                    console.log(err);
                }
            });
        });
    }

    static deleteProduct(id, price, cb){
        fs.readFile(filePath, (err, fileContent)=>{
            if(err){
                return;
            }

            const updatedCart = { ...JSON.parse(fileContent) };
            const product = updatedCart.products.find(prod => prod.id===id);
            if(!product){
                return;
            }

            const productQty = product.qty;
            updatedCart.products = updatedCart.products.filter(prod => prod.id!==id);
            updatedCart.totalPrice = updatedCart.totalPrice - price*productQty;
            fs.writeFile(filePath, JSON.stringify(updatedCart), (err)=>{
                if(err){
                    console.log(err);
                }
            });
            cb();
        });
    }

    static getCart(cb){
        fs.readFile(filePath, (err, fileContent)=>{
            const cart = JSON.parse(fileContent);
            if(err){
                cb(null);
            }
            else{
                cb(cart);
            }
        })
    }
}
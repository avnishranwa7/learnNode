const fs = require('fs');
const path = require('path');

const rootDir = require('../util/path');
const filePath = path.join(rootDir, 'data', 'products.json');
const Cart = require('./cart');

const getProductsFromFile = (cb) => {
    fs.readFile(filePath, (err, fileContent)=>{
        if(err){
            cb([]);
        }
        else{
            cb(JSON.parse(fileContent));
        }
    });
}

module.exports = class Product{
    constructor(id, title, imageUrl, price, description){
        this.id = id;
        this.title = title;
        this.imageUrl = imageUrl;
        this.price = price;
        this.description = description;
    }

    save(){
        getProductsFromFile((products)=>{
            if(this.id){
                const existingProductIndex = products.findIndex(prod => prod.id===this.id);
                const updatedProducts = [...products];
                updatedProducts[existingProductIndex] = this;
                fs.writeFile(filePath, JSON.stringify(updatedProducts), (err)=>{
                    if(err){
                        console.log(err);
                    }
                });
            }
            else{
                this.id = Math.random().toString();
                products.push(this);
                fs.writeFile(filePath, JSON.stringify(products), (err)=>{
                    if(err){
                        console.log(err);
                    }
                });
            }  
        });
    }

    static deleteById(id, cb){
        getProductsFromFile(products=>{
            const product = products.find(prod => prod.id===id);
            const updatedProducts = products.filter(prod => prod.id!==id);
            fs.writeFile(filePath, JSON.stringify(updatedProducts), (err)=>{
                if(!err){
                    Cart.deleteProduct(id, product.price);
                }
            });
        });
        cb();
    }

    static fetchAll(cb){
        getProductsFromFile(cb);
    }

    static findByID(id, cb){
        getProductsFromFile(products=>{
            const product = products.find(p => p.id===id);
            cb(product);
        });
    }
}
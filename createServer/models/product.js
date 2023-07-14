const fs = require('fs');
const path = require('path');

const rootDir = require('../util/path');
const filePath = path.join(rootDir, 'data', 'products.txt');

const getProductsFromFile = (cb) => {
    fs.readFile(filePath, (err, fileContent)=>{
        if(err){
            return cb([]);
        }

        cb(JSON.parse(fileContent));
    });
}

module.exports = class Product{
    constructor(title){
        this.title = title;
    }

    save(){
        getProductsFromFile((products)=>{
            products.push(this);
            fs.writeFile(filePath, JSON.stringify(products), (err)=>{
                if(err){
                    console.log(err);
                }
            });
        });
    }

    static fetchAll(cb){
        getProductsFromFile(cb);
    }
}
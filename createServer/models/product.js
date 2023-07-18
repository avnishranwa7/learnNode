const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const productSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('Product', productSchema);








// const mongodb = require('mongodb');

// const getDb = require('../util/database').getDb;

// class Product{
//     constructor(_id, userId, title, price, imageUrl, description){
//         this._id = _id ? new mongodb.ObjectId(_id) : null;
//         this.userId = userId;
//         this.title = title;
//         this.price = price;
//         this.imageUrl = imageUrl;
//         this.description = description;
//     }

//     save(){
//         const db = getDb();
//         let dbOp;
//         if(!this._id){
//             dbOp = db.collection('products').insertOne(this);
//         }
//         else{
//             dbOp = db.collection('products').updateOne(
//                 {_id: this._id },
//                 {$set: this}
//             );
//         }
//         return dbOp
//         .then(result=>{
//             return result;
//         })
//         .catch(err=>console.log(err));
//     }

//     static update(productId, title, price, imageUrl, description){
//         const db = getDb();
//         return db.collection('products').updateOne(
//             {_id: new mongodb.ObjectId(productId) },
//             {$set: {
//                 title, price, imageUrl, description
//             }}
//         )
//         .then(result=>{
//             console.log(result);
//             return result;
//         })
//         .catch(err=>console.log(err));
//     }

//     static fetchAll(){
//         const db = getDb();
//         return db.collection('products').find().toArray()
//         .then(products=>{
//             return products;
//         })
//         .catch(err=>console.log(err));
//     }

//     static findById(productId){
//         const db = getDb();
//         return db.collection('products').findOne({ _id: new mongodb.ObjectId(productId) })
//         .then(product=>{ 
//             return product;
//         })
//         .catch(err=>console.log(err));
//     }

//     static deleteById(productId){
//         const db = getDb();
//         return db.collection('products').deleteOne({ _id: new mongodb.ObjectId(productId) })
//         .then(result=>{
//             return result;
//         })
//         .catch(err=>console.log(err));
//     }
// }

// module.exports = Product;
const mongoose = require('mongoose');

const Product = require('./product');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    resetToken: String,
    resetTokenExpiration: Date,
    cart: {
        items: [
            {
                productId: {
                    type: Schema.Types.ObjectId,
                    required: true,
                    ref: 'Product'
                },
                quantity: {
                    type: Number,
                    required: true
                }
            }
        ]
    }
});

userSchema.methods.addToCart = function(product){
    const cartProductIndex = this.cart.items.findIndex(prod => {
        return prod.productId.toString() === product._id.toString();
    });

    let quantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartProductIndex >= 0) {
        quantity += this.cart.items[cartProductIndex].quantity;
        updatedCartItems[cartProductIndex].quantity = quantity;
    }
    else {
        updatedCartItems.push({ productId: product._id, quantity: 1 });
    }

    const updatedCart = { items: updatedCartItems };
    this.cart = updatedCart;

    return this.save();
}

userSchema.methods.deleteCartItem = function(productId) {
    const updatedCartItems = this.cart.items.filter(item => {
      return item.productId.toString() !== productId.toString();
    });
    this.cart.items = updatedCartItems;
    return this.save();
};

userSchema.methods.clearCart = function(productId){
    this.cart.items = [];
    return this.save();
}

module.exports = mongoose.model('User', userSchema);









// const mongodb = require('mongodb');

// const getDb = require('../util/database').getDb;
// const Product = require('./product');

// const ObjectId = mongodb.ObjectId;

// class User {
//     constructor(_id, username, email, cart) {
//         this._id = _id;
//         this.name = username;
//         this.email = email;
//         this.cart = cart;
//     }

//     static findById(userId) {
//         const db = getDb();
//         return db.collection('users').findOne({ _id: new ObjectId(userId) });
//     }

//     save() {
//         const db = getDb();
//         return db.collection('users').insertOne(this);
//     }

//     addToCart(product) {
//         const db = getDb();
//         const cartProductIndex = this.cart.items.findIndex(prod => {
//             return prod.productId.toString() === product._id.toString();
//         });

//         let quantity = 1;
//         const updatedCartItems = [...this.cart.items];

//         if (cartProductIndex >= 0) {
//             quantity += this.cart.items[cartProductIndex].quantity;
//             updatedCartItems[cartProductIndex].quantity = quantity;
//         }
//         else {
//             updatedCartItems.push({ productId: product._id, quantity: 1 });
//         }

//         const updatedCart = { items: updatedCartItems };

//         return db.collection('users').updateOne(
//             { _id: new ObjectId(this._id) },
//             {
//                 $set: {
//                     cart: updatedCart
//                 }
//             }
//         );
//     }

//     getCart(){
//         const db = getDb();
//         let cartItemIds = this.cart.items.map(item=>{
//             return item.productId;
//         });
//         return db.collection('products').find({_id: {$in: cartItemIds}}).toArray()
//         .then(products=>{
//             return products.map(product=>{
//                 return {
//                     ...product,
//                     quantity: this.cart.items.find(item=>{
//                         return item.productId.toString()===product._id.toString();
//                     }).quantity
//                 };
//             })
//         })
//         .catch(err=>console.log(err));
//     }

//     deleteCartItem(productId){
//         const db = getDb();
//         let updatedCart = this.cart.items.filter(item=>{
//             return item.productId.toString()!==productId
//         });

//         return db.collection('users').updateOne(
//             { _id: new ObjectId(this._id) },
//             {
//                 $set: {
//                     cart: {
//                         items: updatedCart
//                     }
//                 }
//             }
//         )
//     }

//     addOrder(){
//         const db = getDb();
//         return this.getCart()
//         .then(products=>{
//             const order = {
//                 items: products,
//                 user: {
//                     _id: new ObjectId(this._id),
//                     name: this.name
//                 }
//             };
//             return db.collection('orders').insertOne(order);
//         })
//         .then(()=>{
//             this.cart = {items: []};
//             return db.collection('users').updateOne(
//                 { _id: new ObjectId(this._id) },
//                 {
//                     $set: {
//                         cart: {
//                             items: []
//                         }
//                     }
//                 }
//             )
//         })
//         .catch(err=>console.log(err));
//     }

//     getOrders(){
//         const db = getDb();
//         return db.collection('orders').find({'user._id': new ObjectId(this._id)}).toArray();
//     }
// }

// module.exports = User;
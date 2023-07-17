const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = (callback)=>{
    MongoClient.connect('mongodb+srv://avnishranwa7:0XLcbnT14MhInnc7@cluster0.7vw33kc.mongodb.net/shop?retryWrites=true&w=majority')
    .then(client=>{
        console.log('Connected to MongoDB!');
        _db = client.db();
        callback();
    })
    .catch(err=>{
        console.log(err);
        throw err;
    });
}

const getDb = ()=>{
    if(_db){
        return _db;
    }

    throw 'No DB found!';
}

module.exports = {
    mongoConnect, getDb
};
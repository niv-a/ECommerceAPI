// importing mongoose
const mongoose = require('mongoose');
const mongoURI = 'mongodb://localhost:27017/rynokECommerce?readPreference=primary&appname=MongoDB%20Compass&ssl=false';

// creating the function to connect to DB
const connectToMongo = () => {
    mongoose.connect(mongoURI, () => {
        console.log("connected to mongo successfully ....");
    })
}

module.exports = connectToMongo;
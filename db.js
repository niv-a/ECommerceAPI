// importing mongoose
const mongoose = require("mongoose");
require("dotenv").config();
const mongoURI = process.env.MONGODB_LINK;

// creating the function to connect to DB
const connectToMongo = () => {
  mongoose.connect(mongoURI, () => {
    console.log("connected to mongo successfully ....");
  });
};

module.exports = connectToMongo;

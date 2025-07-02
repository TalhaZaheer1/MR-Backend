const mongoose = require("mongoose");
require("dotenv").config();

async function connectToDb() {
  try{
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB")
  }catch(error){
    console.error("MONGO DB ERROR",error) 
  }
}

module.exports = {connectToDb};

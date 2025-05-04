const mongoose = require("mongoose");
require("dotenv").config();


const MONGOURI = process.env.MONGODB;

async function initialiseDatabaseConnection(params) {
    mongoose.connect(MONGOURI).then(()=>console.log("DB connected.")).catch(()=>console.log("An error occurred while connected to DB."))

    
}

module.exports = {initialiseDatabaseConnection};




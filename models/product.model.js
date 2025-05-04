const mongoose = require("mongoose");


const productSchema = new mongoose.Schema({
    name:{type:String,required:true},
    description:[{type:String,required:true}],
    category:{type:mongoose.Schema.Types.ObjectId, ref:"Category"},
    price:{type:Number,required:true},
    discount:{type:Number},
    rating:{type:Number},
    quantityAvailable:{type:Number,required:true},
    photoUrl:[{type:String}],
    returnPolicty:{type:String,enum:['10 days returnable','No return']},
    size:{type:String}
    
},{timestamps:true})

const Product = mongoose.model('Product',productSchema);

module.exports = Product;
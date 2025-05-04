const mongoose = require("mongoose");


const cartSchema =  new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'UserEcom'
    },
    products:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Product',

    },
    quantity:{
        type:Number,
        required:true,
        default:1
    },
    price:{
        type:Number,
        required:true
    }
})

const Cart = mongoose.model('Cart',cartSchema);

module.exports = Cart;
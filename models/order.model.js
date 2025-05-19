const mongoose = require("mongoose");
const {addressSchema} = require("./address.model");



const orderSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'UserEcom',
        required:true
    },
    items:[
        { product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true
      },
      quantity:{type:Number,required:true},
      price:{type:Number}
    }
    ],

    totalAmount:{
        type:Number,
        required:true
    },
    totalAmountWithDiscount:{
        type:Number,
        required:true
    },
    paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending"
  },
  orderStatus: {
    type: String,
    enum: ["Placed", "Processing", "Shipped", "Delivered", "Cancelled"],
    default: "Placed"
  },
  shippingAddress: {
    type: addressSchema,
    required: true
  }

},{timestamps:true})

const Order = mongoose.model("Order",orderSchema);
module.exports = Order;
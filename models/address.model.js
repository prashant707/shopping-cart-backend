const mongoose = require("mongoose");


const addressSchema = new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'UserEcom',
        required:true
    },
    fullName:{type:String,required:true},
    phoneNumber:{type:String,required:true},
    addressLine1:{type:String,required:true},
    addressLine2:{type:String},
    pincode:{type:String,required:true},
    state:{type:String,required:true},
    city:{type:String,required:true},
    country:{type:String,required:true},
    houseNumber:{type:String,required:true},
    landmark:{type:String},
    addressType:{
        type:String,
        enum:["Home","Work","Other"],
        default:"Home"
    }

},{timestamps:true});

const Address = mongoose.model("Address",addressSchema);
module.exports = {Address,addressSchema};
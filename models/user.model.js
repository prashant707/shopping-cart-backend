const mongoose = require("mongoose");

const userEcomSchema = new mongoose.Schema({
    name:{type:String,required:true},
    email: {type:String,required:true,unique:true},
    password:{type:String,required:true},
    phone:{type:String},
    role:{type:String,enum:['customer','admin'],default:'customer'}
},{
    timestamps:true
})

const UserEcom = mongoose.model('UserEcom',userEcomSchema);

module.exports = UserEcom;
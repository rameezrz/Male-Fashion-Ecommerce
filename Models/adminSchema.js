const mongoose = require('mongoose'); 

// Declare the Schema of the Mongo model
var adminSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true,
    },
});

//Export the model
module.exports = mongoose.model('Admin', adminSchema);
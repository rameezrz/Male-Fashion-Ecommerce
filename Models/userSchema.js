const mongoose = require('mongoose'); // Erase if already required

var userSchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        index:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    phone:{
        type:String,
        required:true,
        unique:true,
    },
    password:{
        type:String,
        required:true,
    },
    isBlocked: {
        type: Boolean,
        required:true,
    }
});

//Export the model
module.exports = mongoose.model('User', userSchema);
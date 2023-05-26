const mongoose = require('mongoose'); 

var categorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
        unique:true,
        index:true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

//Export the model
module.exports = mongoose.model('Category', categorySchema);
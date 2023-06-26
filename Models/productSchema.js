const mongoose = require('mongoose'); 

// Declare the Schema of the Mongo model
var productSchema = new mongoose.Schema({
    productName:{
        type:String,
        required:true,
    }, brand: {
        type: String,
        required:true,
    },
    productPrice:{
        type:Number,
        required:true,
    },
    salePrice:{
        type:Number,
        required:true,
    },
    stock:{
        type:Number,
        required:true,
    },
    description:{
        type:String,
        required:true,
    },
    isRemoved: {
        type:Boolean,
        default:false
    },
    category: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Category',
    },
    subCategory: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'subCategory',
    },
    images: [
        {
           filename:String 
        }
    ],
    isRemoved: {
        type: Boolean,
        default:false
    }
}, {
    timestamps:true
});

//Export the model
module.exports = mongoose.model('Product', productSchema);
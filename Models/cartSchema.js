const mongoose = require('mongoose'); // Erase if already required

// Declare the Schema of the Mongo model
var cartSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
    }, coupon: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Coupon',
    }, subTotal: String,
    discountAmount: String,
    totalAmount:String
    ,products: [
        {
            item: {
                type:mongoose.Schema.Types.ObjectId
            },
            variantId: {
                type:mongoose.Schema.Types.ObjectId
            },
            quantity: {
                type:Number
            }
        }
    ]
}, {
    timestamps:true
});

//Export the model
module.exports = mongoose.model('Cart', cartSchema);
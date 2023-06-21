const mongoose = require('mongoose')

var addressSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref:'User'
    },
    deliveryAddress: [
        {
            firstName: {
                type: String
            },
            
            lastName: {
                type: String
            },
            phone: String,
            email: String,
            address1: {
                type: String
            },
            address2: {
                type: String
            }, city: {
                type: String
            }, state: {
                type: String
            }, country: {
                type: String
            }, pincode: {
                type: String,
            }
        }
    ],
}, {
    timestamps: true
}
)

module.exports = mongoose.model('Address',addressSchema)
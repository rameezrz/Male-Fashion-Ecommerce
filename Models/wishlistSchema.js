const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema({
    user:{
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
    },
    products: [
        {
            item: {
                type:mongoose.Schema.Types.ObjectId
            }
        }
    ]
}, {
    timestamps:true
})

module.exports = mongoose.model('Wishlist',wishlistSchema)
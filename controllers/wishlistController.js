const cartHelper = require('../helpers/cartHelper')
const wishlistHelper = require('../helpers/wishlistHelper')

const displayWishlist = async (req, res) => {
    try {
        const isUserLoggedIn = req.session.isUserLoggedIn || false;
        const userName = isUserLoggedIn ? req.session.userName : "";
        const activeMenuItem = "/shop";
        let cartCount = 0
        if (isUserLoggedIn) {
        cartCount = await cartHelper.getCartCount(req.session.user._id)
        }
        const userId = req.session.user._id
        let products = await wishlistHelper.getWishlistProducts(userId)
        res.render('user/wishlist', {
            isUserLoggedIn, userName, activeMenuItem, products, cartCount,
            layout: "layouts/profileLayout",
            activeMenuItem:"/wishlist"
        })
    } catch (error) {
        console.log(error);
    }
}

const addToWishlist = async(req, res) => {
    try {
        if (req.session.user) {
            const userId = req.session.user._id
            const {productId} = req.body
            const response = await wishlistHelper.addToWishlist(userId, productId)
            if (response === true) {
                res.json({isUserLoggedIn:true,status:true})
            } else {
                res.json({isUserLoggedIn:true,status:false}) 
            } 
        } else {
            res.json({isUserLoggedIn:false})
        }
    } catch (error) {
        console.log(error);
    }
}

//Remove Product from Cart
const removeProduct = async(req, res) => {
    try {
        let response = await wishlistHelper.removeProduct(req.body)
        res.json(response)
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    displayWishlist,
    addToWishlist,
    removeProduct
}
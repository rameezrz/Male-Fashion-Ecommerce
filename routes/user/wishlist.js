const express = require('express')
const router = express.Router()
const wishlistController = require('../../controllers/wishlistController')
const validateToken = require('../../middlewares/jwtAuth')
const isLoggedIn = require('../../middlewares/isLoggedIn')


//Wishlist Route
router.get('/profile/wishlist', isLoggedIn, validateToken, wishlistController.displayWishlist)
router.post('/add-to-wishlist', isLoggedIn, validateToken, wishlistController.addToWishlist)
router.post('/remove-product-wishlist', isLoggedIn, validateToken, wishlistController.removeProduct)


module.exports = router
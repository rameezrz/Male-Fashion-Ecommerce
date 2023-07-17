const express = require('express')
const router = express.Router()
const cartController = require('../../controllers/cartController')
const validateToken = require('../../middlewares/jwtAuth')
const isLoggedIn = require('../../middlewares/isLoggedIn')


//Cart Route
router.post('/add-to-cart',isLoggedIn,validateToken,cartController.addToCart)
router.get('/cart',isLoggedIn, validateToken, cartController.displayCart)
router.post('/change-product-quantity',isLoggedIn,validateToken,cartController.changeProductQuantity)
router.post('/remove-product', isLoggedIn, validateToken, cartController.removeProduct)


module.exports = router
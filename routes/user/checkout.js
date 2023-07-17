const express = require('express')
const router = express.Router()
const cartController = require('../../controllers/cartController')
const orderController = require('../../controllers/orderController')
const validateToken = require('../../middlewares/jwtAuth')
const isLoggedIn = require('../../middlewares/isLoggedIn')


//Checkout Route
router.get('/shop/checkout', isLoggedIn, validateToken, cartController.displayCheckout)
router.get('/shop/checkout/apply-coupon/:id', isLoggedIn, validateToken, cartController.applyCoupon)
router.get('/shop/checkout/remove-coupon/:id', isLoggedIn, validateToken, cartController.removeCoupon)
router.post('/place-order', isLoggedIn, validateToken, orderController.placeOrder)
router.get('/order-success', isLoggedIn, validateToken, orderController.orderSuccess)
router.post('/verify-payment', isLoggedIn, validateToken, orderController.verifyPayment)


module.exports = router
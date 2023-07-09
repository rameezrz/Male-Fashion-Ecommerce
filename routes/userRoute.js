const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const cartController = require('../controllers/cartController')
const orderController = require('../controllers/orderController')
const addressController = require('../controllers/addressController')
const wishlistController = require('../controllers/wishlistController')
const reviewController = require('../controllers/reviewController')
const isAuth = require('../middlewares/sessionHandler')
const validateToken = require('../middlewares/jwtAuth')
const isLoggedIn = require('../middlewares/isLoggedIn')

//home route
router.get('/', userController.baseRoute)

//Auth Routes
router.get('/user-registration',isAuth,userController.displayRegistration)
router.post('/user-registration',isAuth,userController.registration)
router.get('/user-signin',isAuth,userController.displaySignIn)
router.post('/user-signin', isAuth, userController.signIn)
router.get('/otp-login', isAuth,userController.displayOtpLogin)
router.post('/send-otp', isAuth,userController.sendOtp) 
router.post('/check-login-otp', isAuth,userController.checkLoginOtp)
router.get('/user-otp',isAuth,userController.userOtp)
router.post('/user-otp',isAuth,userController.checkOtp)
router.get('/resend-user-otp',isAuth,userController.resendOtp)


//Shop Route
router.get('/shop', userController.displayShop)
router.get('/shop/filter', userController.displayShopByFilters)
router.get('/shop/category/:id',userController.shopByCategory)
router.get('/shop/product/:id', userController.displayProduct)


//Cart Route
router.post('/add-to-cart',isLoggedIn,validateToken,cartController.addToCart)
router.get('/cart',isLoggedIn, validateToken, cartController.displayCart)
router.post('/change-product-quantity',isLoggedIn,validateToken,cartController.changeProductQuantity)
router.post('/remove-product', isLoggedIn, validateToken, cartController.removeProduct)



//Checkout Route
router.get('/shop/checkout', isLoggedIn, validateToken, cartController.displayCheckout)
router.get('/shop/checkout/apply-coupon/:id', isLoggedIn, validateToken, cartController.applyCoupon)
router.get('/shop/checkout/remove-coupon/:id', isLoggedIn, validateToken, cartController.removeCoupon)
router.post('/place-order', isLoggedIn, validateToken, orderController.placeOrder)
router.get('/order-success', isLoggedIn, validateToken, orderController.orderSuccess)
router.post('/verify-payment', isLoggedIn, validateToken, orderController.verifyPayment)

//profile Route
router.get('/profile',isLoggedIn,validateToken,userController.displayProfile)
router.get('/profile/orders', isLoggedIn, validateToken, orderController.displayOrders)
router.get('/order-detail/:id', isLoggedIn, validateToken, orderController.orderDetails)
router.post('/order/add-review',isLoggedIn, validateToken, reviewController.addReview)
router.get('/order/edit-review/:orderId/:productId',isLoggedIn, validateToken, reviewController.fetchReview)
router.put('/order/edit-review',isLoggedIn, validateToken, reviewController.editReview)
router.delete('/order/delete-review',isLoggedIn, validateToken, reviewController.deleteReview)
router.post('/order-cancel', isLoggedIn, validateToken, orderController.cancelOrder)
router.post('/order-return', isLoggedIn, validateToken, orderController.returnOrder)
router.get('/profile/addresses', isLoggedIn, validateToken, addressController.displayAddress)
router.post('/profile/add-new-address', isLoggedIn, validateToken, addressController.addAddress)
router.get('/profile/delete-address/:userId/:addressId', isLoggedIn, validateToken, addressController.deleteAddress)
router.get('/profile/edit-address/:userId/:addressId', isLoggedIn, validateToken, addressController.displayEditAddress)
router.post('/profile/edit-address', isLoggedIn, validateToken, addressController.editAddress)
router.get('/profile/change-password', isLoggedIn, validateToken, userController.displayChangePassword)
router.post('/profile/change-password-check', isLoggedIn, validateToken, userController.checkPassword)
router.post('/profile/change-password', isLoggedIn, validateToken, userController.changePassword)

//Wishlist Route
router.get('/profile/wishlist', isLoggedIn, validateToken, wishlistController.displayWishlist)
router.post('/add-to-wishlist', isLoggedIn, validateToken, wishlistController.addToWishlist)
router.post('/remove-product-wishlist', isLoggedIn, validateToken, wishlistController.removeProduct)

//Logout Route
router.get('/logout',userController.logout)

module.exports = router
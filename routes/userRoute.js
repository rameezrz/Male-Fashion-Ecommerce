const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const isAuth = require('../middlewares/sessionHandler')

//home route
router.get('/', userController.baseRoute)

//Auth Routes
router.get('/user_registration',isAuth,userController.displayRegistration)
router.post('/user_registration',isAuth,userController.registration)
router.get('/user_signin',isAuth,userController.displaySignIn)
router.post('/user_signin', isAuth, userController.signIn)
router.get('/otp-login', isAuth,userController.displayOtpLogin)
router.post('/send-otp', isAuth,userController.sendOtp) 
router.post('/check-login-otp', isAuth,userController.checkLoginOtp)
router.get('/user_otp',isAuth,userController.userOtp)
router.post('/user_otp',isAuth,userController.checkOtp)
router.get('/resend_user_otp',isAuth,userController.resendOtp)


//Shop Route
router.get('/shop', userController.displayShop)
router.get('/shop/category/:id',userController.shopByCategory)
router.get('/shop/brand/',userController.shopByCategory)
router.get('/shop/product/:id', userController.displayProduct)

//Logout Route
router.get('/logout',userController.logout)

module.exports = router
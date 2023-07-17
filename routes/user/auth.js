const express = require('express')
const router = express.Router()
const userController = require('../../controllers/userController')
const isAuth = require('../../middlewares/sessionHandler')


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
router.get('/resend-user-otp', isAuth, userController.resendOtp)


//Logout Route
router.get('/logout', userController.logout)

module.exports = router
const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const validateToken = require('../middlewares/jwtAuth')

//home route
router.get('/',userController.baseRoute)
router.get('/user_registration',userController.displayRegistration)
router.post('/user_registration',userController.registration)
router.get('/user_signin',userController.displaySignIn)
router.post('/user_signin',userController.signIn)
router.get('/user_otp',userController.userOtp)
router.post('/user_otp',userController.checkOtp)
router.get('/resend_user_otp',userController.resendOtp)
router.get('/customers', validateToken, userController.displayCustomers)


module.exports = router
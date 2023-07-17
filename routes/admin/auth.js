const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/adminController')
const validateToken = require("../../middlewares/jwtAuthAdmin")


//Auth Routes
//Login
router.get('/login', adminController.displayLogin)
router.post('/login', adminController.postLogin)

//Logout 
router.get('/logout',validateToken,adminController.logout)

//Export
module.exports = router
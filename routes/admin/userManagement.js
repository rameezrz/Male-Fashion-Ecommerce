const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/adminController')
const validateToken = require("../../middlewares/jwtAuthAdmin")


//User Management Routes
router.get('/user-management', validateToken, adminController.displayUsers)
router.get('/block-user/:id',validateToken,adminController.blockUser)
router.get('/unblock-user/:id', validateToken, adminController.UnblockUser)


//Export
module.exports = router
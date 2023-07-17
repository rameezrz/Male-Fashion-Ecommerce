const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/adminController')
const validateToken = require("../../middlewares/jwtAuthAdmin")


//Order Routes
router.get('/orders',validateToken,adminController.displayOrders)
router.get('/order-detail/:id',validateToken,adminController.orderDetails)
router.post('/order-detail/delivered',validateToken,adminController.deliverOrder)
router.post('/order-cancel', validateToken, adminController.cancelOrder)

//Export
module.exports = router
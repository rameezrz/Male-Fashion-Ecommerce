const express = require('express')
const router = express.Router()
const couponController = require('../../controllers/couponController')
const validateToken = require("../../middlewares/jwtAuthAdmin")


//Coupon Routes
router.get('/coupon',validateToken,couponController.displayCoupon)
router.post('/add-coupon',validateToken,couponController.addCoupon)
router.get('/edit-coupon/:id',validateToken,couponController.displayEditCoupon)
router.post('/edit-coupon',validateToken,couponController.editCoupon)
router.get('/delete-coupon/:id', validateToken, couponController.deleteCoupon)


//Export
module.exports = router
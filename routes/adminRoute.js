const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const categoryController = require('../controllers/categoryController')
const couponController = require('../controllers/couponController')
const validateToken = require("../middlewares/jwtAuthAdmin")

//Auth Routes
router.get('/login', adminController.displayLogin)
router.post('/login', adminController.postLogin)

//Dashboard
router.get('/',validateToken, adminController.dashboard)


//User Management Routes
router.get('/user-management', validateToken, adminController.displayUsers)
router.get('/block-user/:id',validateToken,adminController.blockUser)
router.get('/unblock-user/:id', validateToken,adminController.UnblockUser)

//Category Routes
router.get('/add-categories',validateToken,adminController.displayAddCategories)
router.get('/add-subCategories',validateToken,adminController.displayAddSubCategories)
router.post('/add-category',validateToken,adminController.addCategory)
router.post('/edit-category',validateToken,categoryController.editCategory)
router.get('/delete-category/:id',validateToken,adminController.deleteCategory)
router.post('/add-subCategory', validateToken, adminController.addSubCategory)
router.post('/edit-subCategory', validateToken, categoryController.editSubCategory)
router.get('/delete-subCategory/:id',validateToken,adminController.deleteSubCategory)
router.post('/get-subCategory',validateToken,adminController.getSubCategory)

//Product Routes
router.get('/products',validateToken, adminController.displayProducts)
router.get('/add-product',validateToken,adminController.displayAddProduct)
router.post('/add-product',validateToken,adminController.addProduct)
router.post('/add-product-image',validateToken,adminController.addProductImage)
router.get('/edit-product/:id',validateToken,adminController.displayEditProduct)
router.post('/edit-product',validateToken,adminController.editProduct)
router.post('/edit-product-image',validateToken,adminController.editProductImage)
router.get('/delete-product/:id',validateToken,adminController.deleteProduct)
router.post('/delete-product-image',validateToken,adminController.deleteProductImage)
router.get('/unblock-product/:id', validateToken, adminController.unblockProduct)

//Order Routes
router.get('/orders',validateToken,adminController.displayOrders)
router.get('/order-detail/:id',validateToken,adminController.orderDetails)
router.post('/order-cancel', validateToken, adminController.cancelOrder)

//Coupon Routes
router.get('/coupon',validateToken,couponController.displayCoupon)
router.post('/add-coupon',validateToken,couponController.addCoupon)
router.get('/edit-coupon/:id',validateToken,couponController.displayEditCoupon)
router.post('/edit-coupon',validateToken,couponController.editCoupon)
router.get('/delete-coupon/:id',validateToken,couponController.deleteCoupon)

//Logout 
router.get('/logout',validateToken,adminController.logout)

//Export
module.exports = router
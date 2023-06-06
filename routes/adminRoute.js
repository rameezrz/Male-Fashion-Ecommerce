const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')
const validateToken = require("../middlewares/jwtAuthAdmin")

//Auth Routes
router.get('/admin_login', adminController.displayLogin)
router.post('/admin_login', adminController.postLogin)

//Dashboard
router.get('/admin_panel',validateToken, adminController.dashboard)


//User Management Routes
router.get('/admin_panel/user_management', validateToken, adminController.displayUsers)
router.get('/admin_panel/block_user/:id',validateToken,adminController.blockUser)
router.get('/admin_panel/unblock_user/:id', validateToken,adminController.UnblockUser)

//Category Routes
router.get('/admin_panel/addCategories',validateToken,adminController.displayAddCategories)
router.get('/admin_panel/addSubCategories',validateToken,adminController.displayAddSubCategories)
router.post('/admin_panel/add_category',validateToken,adminController.addCategory)
router.get('/admin_panel/delete_category/:id',validateToken,adminController.deleteCategory)
router.post('/admin_panel/add_subCategory', validateToken, adminController.addSubCategory)
router.get('/admin_panel/delete_subCategory/:id',validateToken,adminController.deleteSubCategory)
router.post('/admin_panel/get_subCategory',validateToken,adminController.getSubCategory)

//Product Routes
router.get('/admin_panel/products',validateToken, adminController.displayProducts)
router.get('/admin_panel/add_product',validateToken,adminController.displayAddProduct)
router.post('/admin_panel/add_product',validateToken,adminController.addProduct)
router.get('/admin_panel/edit_product/:id',validateToken,adminController.displayEditProduct)
router.post('/admin_panel/edit_product',validateToken,adminController.editProduct)
router.get('/admin_panel/delete_product/:id',validateToken,adminController.deleteProduct)
router.get('/admin_panel/unblock_product/:id', validateToken, adminController.unblockProduct)

//Logout 
router.get('/adminLogout',validateToken,adminController.logout)

//Export
module.exports = router
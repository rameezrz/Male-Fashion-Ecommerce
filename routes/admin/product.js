const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/adminController')
const validateToken = require("../../middlewares/jwtAuthAdmin")


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

//Export
module.exports = router
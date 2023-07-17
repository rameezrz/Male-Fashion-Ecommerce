const express = require('express')
const router = express.Router()
const userController = require('../../controllers/userController')
const variantController = require('../../controllers/variantController')


//Shop Route
router.get('/shop', userController.displayShop)
router.get('/shop/filter', userController.displayShopByFilters)
router.get('/shop/category/:id',userController.shopByCategory)
router.get('/shop/product/:id', userController.displayProduct)
router.get('/shop/products/get-colors-by-size', variantController.getColors)
router.get('/shop/products/get-variant', variantController.getVariantByFilters)


module.exports = router
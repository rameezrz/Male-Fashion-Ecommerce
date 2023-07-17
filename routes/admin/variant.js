const express = require('express')
const router = express.Router()
const variantController = require('../../controllers/variantController')
const validateToken = require("../../middlewares/jwtAuthAdmin")


//Variant Routes
router.get('/add-variant',validateToken,variantController.displayAddVariant)
router.post('/add-variant',validateToken,variantController.addVariant)
router.get('/edit-variant/:productId/:variantId',validateToken,variantController.displayVariantData)
router.put('/edit-variant',validateToken,variantController.editVariant)
router.delete('/delete-variant',validateToken,variantController.deleteVariant)
router.get('/product-variants',validateToken,variantController.displayProductVariant)

//Export
module.exports = router
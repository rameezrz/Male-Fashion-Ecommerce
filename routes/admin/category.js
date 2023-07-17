const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/adminController')
const categoryController = require('../../controllers/categoryController')
const validateToken = require("../../middlewares/jwtAuthAdmin")


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

//Export
module.exports = router
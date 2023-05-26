const express = require('express')
const router = express.Router()
const adminController = require('../controllers/adminController')

router.get('/admin_login', (req, res) => {
    res.send("admin Login")
})

router.get('/admin_panel', (req, res) => {
    res.render('admin/indexAdmin')
})

router.get('/admin_panel/user_management', adminController.displayUsers)
router.get('/admin_panel/block_user/:id',adminController.blockUser)
router.get('/admin_panel/unblock_user/:id', adminController.UnblockUser)

router.get('/admin_panel/categories',adminController.displayCategories)
router.post('/admin_panel/add_category',adminController.addCategory)
router.post('/admin_panel/add_subCategory', adminController.addSubCategory)



router.get('/admin_panel/products', (req, res) => {
    res.render('admin/products')
})








module.exports = router
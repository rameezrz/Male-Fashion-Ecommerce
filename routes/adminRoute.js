const express = require('express')
const router = express.Router()

router.get('/admin_login', (req, res) => {
    res.send("admin Login")
})

router.get('/admin_panel', (req, res) => {
    res.render('admin/indexAdmin')
})

router.get('/admin_panel/user_management', (req, res) => {
    res.render('admin/customers')
})

router.get('/admin_panel/products', (req, res) => {
    res.render('admin/products')
})








module.exports = router
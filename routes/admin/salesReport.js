const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/adminController')
const validateToken = require("../../middlewares/jwtAuthAdmin")


//Sales Reports
router.get('/sales-report',validateToken,adminController.displaySalesReport)
router.post('/sales-report/custom',validateToken,adminController.customSalesReport)

//Export
module.exports = router
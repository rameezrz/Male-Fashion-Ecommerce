const express = require('express')
const router = express.Router()
const adminController = require('../../controllers/adminController')
const validateToken = require("../../middlewares/jwtAuthAdmin")


//Dashboard
router.get('/',validateToken, adminController.dashboard)
router.get('/dashboard-data',validateToken, adminController.getDashboardChartData)

//Export
module.exports = router
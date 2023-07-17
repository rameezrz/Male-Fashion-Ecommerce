const express = require('express')
const router = express.Router()
const bannerController = require('../../controllers/bannerController')
const validateToken = require("../../middlewares/jwtAuthAdmin")




//Banner Routes
router.get('/banner', validateToken, bannerController.displayBannerManagement)
router.post('/banner', validateToken, bannerController.addBanner)





//Export
module.exports = router
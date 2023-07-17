const express = require('express')
const router = express.Router()
const userController = require('../../controllers/userController')


//home route
router.get('/', userController.baseRoute)

//contact Route
router.get('/contact', userController.displayContact)


module.exports = router
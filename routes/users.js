var express = require('express')
var router = express.Router()

// Require controller modules
var userController = require('../controllers/userController')

/// USER ROUTES ///

/* GET all gifts for one User . */
router.get('/:id/gifts', userController.user_gifts)

/* GET get all interests for one User and one Gift */
router.get('/:id/gifts/:giftId/interests', userController.user_gifts_interests)

module.exports = router
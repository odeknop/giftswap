var express = require('express')
var router = express.Router()

// Require controller modules
var giftController = require('../controllers/giftController')

/// GIFT ROUTES ///

/* GET all gifts. */
router.get('/', giftController.index)

/* GET search gifts */
router.get('/search', giftController.gift_search)

/* GET description of one Gift */
router.get('/:id/description', giftController.gift_description)

/* GET select one Gift */
router.get('/:id/vendor', giftController.gift_selection)

module.exports = router
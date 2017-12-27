var express = require('express')
var router = express.Router()

// Require controller modules
var helperController = require('../controllers/helperController')

/// INDEX ROUTES ///

/* GET api home index page */
router.get('/', helperController.index)

/* GET gift preview. */
router.get('/preview', helperController.preview)

module.exports = router
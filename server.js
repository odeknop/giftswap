require('dotenv').config()
var express = require("express")
var app = express()

var path = require('path');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');


var router = express.Router()
var path = __dirname + '/views/'
var bodyParser = require('body-parser')

const Sequelize = require('sequelize')

const sequelize = new Sequelize(process.env.DATABASE_URL)

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var port = process.env.PORT || 8080;

router.use(function (req, res, next) {
	console.log("/" + req.method + " " + req.path)
	next()
})

router.get("/",function(req, res) {
	res.sendFile(path + "index.html")
})

const models = require('./models')

router.get("/users", function(req, res) {
	models.User.findAll({limit: 10}).then(users => {
		res.send(users)
	})
})

// all gifts
router.get("/gifts", function(req, res, next) {

	offset = parseInt(req.query.offset)
	limit = parseInt(req.query.limit)

	if(isNaN(offset) || isNaN(limit)) {
		err = {"status": 400, "message": "Bad Request - Your request is missing parameters." }
		return next(err)
	}

	addNext = false

	models.Gift.findAll({
		offset: offset,
		limit: limit + 1
	}).then(result => {
		if(result.length > limit) {
			addNext = true
		}
	})

	models.Gift.findAll({
		limit: limit,
		offset: offset,
		order: [
		['ID', 'asc'],
		]
	}).then(gifts => {
		elements = []

		if(offset > 0) {
			prevOffset = offset == 9 ? prevOffset = 0 : prevOffset = offset - 8
			prevLimit = offset == 9 ? prevLimit = 9 : prevLimit = 8
			prevUrl = req.protocol + "://" + req.hostname + "/gifts/?offset=" + prevOffset + "&limit=" + prevLimit
			prevElement = {
				"title": "Pagination",
				"buttons": [{
					"type": "json_plugin_url",
					"url": prevUrl,
					"title": "Page précédente"
				}]
			}
			elements.push(prevElement)
		}

		gifts.forEach(function(gift) {
			url = req.protocol + "://" + req.hostname + "/gifts/" + gift.ID + "/description"
			contactUrl = req.protocol + "://" + req.hostname + "/gifts/" + gift.ID + "/vendor"
			element = {
				"title": gift.title,
				"image_url": gift.picture,
				"subtitle": gift.location,
				"buttons": [{
					"set_attributes":
					{
						"selectedGiftId": gift.ID,
					},
					"url": contactUrl,
					"type": "json_plugin_url",
					"title": "Intéressé"
				},
				{
					"set_attributes":
					{
						"selectedGiftId": gift.ID,
					},
					"type": "json_plugin_url",
					"url": url,
					"title": "Voir la description"
				},
				{
					"type":"element_share",
				}]
			}
			elements.push(element)
		})
		if(addNext == true) {
			nextOffset = offset == 0 ? nextOffset = 9 : nextOffset = offset + 8
			nextLimit = 8
			nextUrl = req.protocol + "://" + req.hostname + "/gifts/?offset=" + nextOffset + "&limit=" + nextLimit
			nextElement = {
				"title": "Navigation",
				"buttons": [{
					"type": "json_plugin_url",
					"url": nextUrl,
					"title": "Page suivante"
				}]
			}
			elements.push(nextElement)
		}
		json = {
			"messages": [{
				"attachment": {
					"type": "template",
					"payload": {
						"template_type": "generic",
						"image_aspect_ratio": "square",
						"elements": elements
					}
				}
			}]
		}
		res.send(json)
	})
})

// gift description
router.get("/gifts/:id/description", function(req, res) {
	models.Gift.findOne({
		where: {
			ID: req.params.id,
		}
	}).then(gift => {
		json = {
			"messages": [{
				"attachment": {
					"type": "template",
					"payload": {
						"template_type": "button",
						"text": gift.description,
						"buttons": [{
							"title": "Contacter le vendeur",
							"type": "show_block",
							"block_names": ["Contacter le vendeur"],
						},
						{
							"title": "Acheter",
							"type": "show_block",
							"block_names": ["Acheter"],
						}]
					}
				}
			}]
		}
		res.send(json)
	})
})

// gift selection
router.get("/gifts/:id/vendor", function(req, res) {
	models.Gift.findOne({
		where: {
			ID: req.params.id,
		}
	}).then(gift => {
		models.User.findOne({
			where: {
				ID: gift.owner,
			}
		}).then(vendor => {
			json = {
				"messages": [{
					"attachment": {
						"type": "template",
						"payload": {
							"template_type": "generic",
							"image_aspect_ratio": "square",
							"elements": [{
								"title": vendor.firstName,
								"subtitle": gift.title,
								"image_url": vendor.profilePicUrl,
								"buttons": [{
									"title": "Contacter le vendeur",
									"type": "show_block",
									"block_names": ["Contacter le vendeur"],
								},
								{
									"title": "Acheter",
									"type": "show_block",
									"block_names": ["Acheter"],
								}]
							}]
						}
					}
				}]
			}
			res.send(json)
		})
	})
})

// parse various different custom JSON types as JSON
app.use(bodyParser.json({ type: 'application/*+json' }))

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

router.get("/preview", function(req, res) {
	giftTitle = req.query.giftTitle + ' ' + req.query.giftPriceFormatted
	preview = {
		"messages": [{
			"attachment": {
				"type": "template",
				"payload": {
					"template_type": "generic",
					"image_aspect_ratio": "square",
					"elements": [{
						"title": giftTitle,
						"image_url": req.query.giftPicture,
						"subtitle": req.query.giftLocation,
						"buttons": [{
							"type": "show_block",
							"block_names": ["Gift preview description"],
							"title": "Voir la description"
						},
						{
							"type": "show_block",
							"block_names": ["Vendre un gift"],
							"title": "Modifier"
						},
						{
							"type": "show_block",
							"block_names": ["Publier"],
							"title": "Publier"
						}]
					}]
				}
			}
		}]
	}
	res.send(preview)
})

app.use("/", router)

app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
        message: err.message,
        error: {"status": err.status, "stack": err.stack}
    })
})

app.use("*",function(req,res) {
	res.sendFile(path + "404.html")
});

app.listen(port, function() {
	console.log('App is running on http://localhost:' + port)
});



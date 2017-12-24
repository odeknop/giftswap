require('dotenv').config()
var express = require("express")
var app = express()
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

router.use(function (req,res,next) {
	console.log("/" + req.method)
	next()
})

router.get("/",function(req,res) {
	res.sendFile(path + "index.html")
})


router.get("/product/:id",function(req, res) {
	console.log(req.params.name)
	res.send('{"id": 1,"name":"iPhone 6","price":"800.00"}')
})

const models = require('./models')

router.get("/users", function(req, res) {
	models.User.findAll({limit: 10}).then(users => {
		res.send(users)
	})
})

router.get("/gifts", function(req, res) {
	models.Gift.findAll({limit: 10}).then(gifts => {
		elements = []
		gifts.forEach(function(gift) {
			element = {
				"title": gift.title,
				"image_url": gift.picture,
				"subtitle": gift.location,
			}
			elements.push(element)
		})
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
		res.setHeader('Content-Type', 'application/json');
		res.send(json)
	})
})

// parse various different custom JSON types as JSON
app.use(bodyParser.json({ type: 'application/*+json' }))

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

router.get("/preview", function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	giftTitle = req.query.giftTitle + ' ' + req.query.giftPriceFormatted
	preview = {
 		"messages": [
   			{
   				"attachment": {
   					"type": "template",
   					"payload": {
   						"template_type": "generic",
   						"image_aspect_ratio": "square",
   						"elements": [
   							{
   								"title": giftTitle,
	      						"image_url": req.query.giftPicture,
	      						"subtitle": req.query.giftLocation,
	      						"buttons": [
	      							{
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
	      							},
	      						]
   							}
   						]
   					}
   				}
   			}
 		]
	}
	res.send(preview)
})

app.use("/", router)

app.use("*",function(req,res) {
	res.sendFile(path + "404.html")
});

app.listen(port, function() {
	console.log('App is running on http://localhost:' + port)
});



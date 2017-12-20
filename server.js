require('dotenv').config()
var express = require("express")
var app = express()
var router = express.Router()
var path = __dirname + '/views/'
var bodyParser = require('body-parser')

const Sequelize = require('sequelize')

console.log(process.env.DATABASE_URL)

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

const VeloInfo = sequelize.define('velo_info', {
	uid: {
		type: Sequelize.INTEGER,
		primaryKey: true
	},
	id: Sequelize.INTEGER,
	imei: Sequelize.STRING,
	license_plate: Sequelize.STRING,
	is_reserved: Sequelize.BOOLEAN,
	loc_valid: Sequelize.BOOLEAN,
	lat: Sequelize.FLOAT,
	lng: Sequelize.FLOAT,
	moving: Sequelize.BOOLEAN,
	state: Sequelize.INTEGER,
	ts: Sequelize.DATE,
	dt_server: Sequelize.DATE,
	dt_device: Sequelize.DATE,
	updated_at: Sequelize.DATE
}, 
{
	timestamps: false,
	tableName: 'velo_info',
})

router.get("/query", function(req, res) {
	VeloInfo.findAll({limit: 10}).then(velos => {
		res.send(velos)
	})
})

// parse various different custom JSON types as JSON
app.use(bodyParser.json({ type: 'application/*+json' }))

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

app.use("/", router)

app.use("*",function(req,res) {
	res.sendFile(path + "404.html")
});

app.listen(port, function() {
	console.log('App is running on http://localhost:' + port)
});

global.__basedir = __dirname;

require('dotenv').config()
var express = require("express")
var path = require('path');
var bodyParser = require('body-parser')

const Sequelize = require('sequelize')
const sequelize = new Sequelize(process.env.DATABASE_URL)

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

var app = express()

// parse various different custom JSON types as JSON
app.use(bodyParser.json({ type: 'application/*+json' }))

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// make express look in the public directory for assets (css/js/img)
app.use(express.static(__dirname + '/public'));

var index = require('./routes/index')
var gifts = require('./routes/gifts')
var users = require('./routes/users')

app.use('/', index)
app.use('/gifts', gifts)
app.use('/users', users)

app.use(function(err, req, res, next) {
    res.status(err.status || 500)
    res.render('error', {
        message: err.message,
        error: {"status": err.status, "stack": err.stack}
    })
})

app.use("*",function(req,res) {
	res.sendFile(path.join(__dirname, 'views', "404.html"))
});

var port = process.env.PORT || 8080;

app.listen(port, function() {
	console.log('App is running on http://localhost:' + port)
});
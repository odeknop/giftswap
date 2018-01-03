global.__basedir = __dirname;

require('dotenv').config()
const express = require("express")
const path = require('path');
const bodyParser = require('body-parser')
const cors = require('express-cors')
const cookieParser = require('cookie-parser')

var app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

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

app.use(cors({
  allowedOrigins: ['*.forestadmin.com'],
  headers: ['Authorization', 'X-Requested-With', 'Content-Type'],
}));

// ForestAdmin
app.use(require('forest-express-sequelize').init({
  modelsDir: __dirname + '/models', // Your models directory.
  envSecret: process.env.FOREST_ENV_SECRET,
  authSecret: process.env.FOREST_AUTH_SECRET,
  sequelize: require('./models').sequelize // The sequelize database connection.
}));

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

var port = process.env.PORT || 3000;

app.listen(port, function() {
	console.log('App is running on http://localhost:' + port)
});
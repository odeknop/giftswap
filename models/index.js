var Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL)

// load models
var models = [
  'Gift',
  'User'
];

models.forEach(function(model) {
  module.exports[model] = sequelize.import(__dirname + '/' + model);
});


module.exports.sequelize = sequelize;
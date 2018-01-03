var Sequelize = require('sequelize');

const sequelize = new Sequelize(process.env.DATABASE_URL)

// load models
var models = [
  'Gift',
  'User',
  'Interest',
];

models.forEach(function(model) {
  module.exports[model] = sequelize.import(__dirname + '/' + model);
});

sequelize.sync().then(() => {
	module.exports.Gift.addFullTextIndex()
})

module.exports.sequelize = sequelize;
var Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
	var Gift = sequelize.define('gift', {
		ID: {
			type: Sequelize.INTEGER,
			primaryKey: true,
		},
		owner: Sequelize.BIGINT,
		title: Sequelize.STRING,
		price: Sequelize.NUMERIC,
		description: Sequelize.STRING,
		coordinates: Sequelize.STRING,
		location: Sequelize.STRING,
		picture: Sequelize.STRING,
		createdAt: Sequelize.DATE,
		updatedAt: Sequelize.DATE,
	})
	Gift.search = function(query, offset, limit) {
		if(sequelize.options.dialect !== 'postgres') {
			console.log('Search is only implemented on POSTGRES database');
			return;
		}
		var Gift = this;
		query = sequelize.getQueryInterface().escape(query);
		console.log("query=" + query);
		return sequelize.query('SELECT * FROM "' + Gift.tableName + '" WHERE "document" @@ plainto_tsquery(\'french\', ' + query + ') LIMIT ' + limit + ' OFFSET ' + offset, { model: Gift });
	}
	return Gift
}
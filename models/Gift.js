var Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('gift', {
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
}
var Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('interest', {
        ID: {
			type: Sequelize.INTEGER,
			primaryKey: true,
		},
		giftId: Sequelize.INTEGER,
		ownerId: Sequelize.INTEGER,
		buyerId: Sequelize.INTEGER,
		status: Sequelize.INTEGER,
		createdAt: Sequelize.DATE,
		updatedAt: Sequelize.DATE
    })
}
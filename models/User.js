var Sequelize = require('sequelize');

module.exports = function(sequelize, DataTypes) {
    return sequelize.define('user', {
        ID: {
			type: Sequelize.BIGINT,
			primaryKey: true,
		},
		uid: Sequelize.BIGINT,
		firstName: Sequelize.STRING,
		lastName: Sequelize.STRING,
		gender: Sequelize.STRING,
		locale: Sequelize.STRING,
		source: Sequelize.STRING,
		ref: Sequelize.STRING,
		timeZone: Sequelize.STRING,
		profilePicUrl: Sequelize.STRING,
		email: Sequelize.STRING,
		phone: Sequelize.STRING,
		comment: Sequelize.STRING,
		createdAt: Sequelize.DATE,
		updatedAt: Sequelize.DATE,
    })
}
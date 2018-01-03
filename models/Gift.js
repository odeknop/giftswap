var Sequelize = require('sequelize')

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
			console.log('Search is only implemented on POSTGRES database')
			return
		}
		var Gift = this
		query = sequelize.getQueryInterface().escape(query)
		console.log("query=" + query)
		return sequelize.query('SELECT * FROM "' + Gift.tableName + '" WHERE "document" @@ plainto_tsquery(\'french\', ' + query + ') LIMIT ' + limit + ' OFFSET ' + offset, { model: Gift })
	}
	Gift.addFullTextIndex = function() {
		if(sequelize.options.dialect !== 'postgres') {
			console.log('Search is only implemented on POSTGRES database')
			return
		}
		var searchFields = ['title', 'description']
		var Gift = this
		var vectorName = "document"
		sequelize
			.query('ALTER TABLE "' + Gift.tableName + '" ADD COLUMN IF NOT EXISTS "' + vectorName + '" TSVECTOR')
			.then( () => {
				return sequelize
					.query('UPDATE "' + Gift.tableName + '" SET "' + vectorName + '" = to_tsvector(\'french\', ' + searchFields.join(' || \' \' || ') + ')')
			}).then( () => {
				return sequelize
					.query('CREATE INDEX IF NOT EXISTS fts_idx  ON "' + Gift.tableName + '" USING gin("' + vectorName + '");')
			}).then( () => {
			    return sequelize
					.query('CREATE TRIGGER gift_vector_update BEFORE INSERT OR UPDATE ON "' + Gift.tableName + '" FOR EACH ROW EXECUTE PROCEDURE tsvector_update_trigger("' + vectorName + '", \'pg_catalog.french\', ' + searchFields.join(', ') + ')')
			}).catch( error => {
				console.log("ERROR: " + error)
			})
	}
	return Gift
}
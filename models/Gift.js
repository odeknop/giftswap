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
	Gift.search = function(query, from_lat, from_long, radius, offset, limit) {
		if(sequelize.options.dialect !== 'postgres') {
			console.log('Search is only implemented on POSTGRES database')
			return
		}
		var Gift = this
		console.log("query=" + query)
		if(query === '' || query===undefined) {
			and = ''
		} else {
			and = 'AND "document" @@ plainto_tsquery(\'french\', ' + sequelize.getQueryInterface().escape(query) + ')'
		}
		return sequelize.query('SELECT *, ST_Distance_sphere(st_makepoint(cast(' + from_long + ' as double precision), cast(' + from_lat + ' as double precision)), st_makepoint(cast(split_part(gb.coordinates, \',\', 2) as double precision), cast(split_part(gb.coordinates, \',\', 1) as double precision))) as distance FROM "' + Gift.tableName + '" AS gb WHERE ST_Distance_sphere( st_makepoint( cast(split_part(gb.coordinates, \',\', 2) as double precision), cast(split_part(gb.coordinates, \',\', 1) as double precision)), st_makepoint(cast(' + from_long + ' as double precision), cast(' + from_lat + ' as double precision)) ) < ' + radius + '  ' + and + ' LIMIT ' + limit + ' OFFSET ' + offset, { model: Gift })
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
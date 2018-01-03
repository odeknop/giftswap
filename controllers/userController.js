const models = require('../models')
const sequelize = require('sequelize')

exports.user_gifts = function(req, res) {

	offset = parseInt(req.query.offset)
	limit = parseInt(req.query.limit)

	addNext = false
	elements = []

	// More info about subqueries at http://srlm.io/2015/02/04/sequelize-subqueries/
	models.Gift.findAll({
		attributes: Object.keys(models.Gift.attributes).concat([[
			sequelize.literal('(SELECT COUNT(*) FROM interests WHERE interests."giftId" = Gift."ID")'),
			'interestsCount'
		]]),
		where: {
			owner: req.params.id,
		},
		offset: offset,
		limit: limit + 1,
		order: [sequelize.literal('"interestsCount" DESC')]
	}).each((gift, index, length) => {
		if(index === 0) {
			if(length > limit) {
				addNext = true
			}
			if(offset > 0) {
				prevOffset = offset == 9 ? prevOffset = 0 : prevOffset = offset - 8
				prevLimit = offset == 9 ? prevLimit = 9 : prevLimit = 8
				prevUrl = req.protocol + "://" + req.hostname + "/users/" + req.params.id + "/gifts?offset=" + prevOffset + "&limit=" + prevLimit
				prevElement = {
					"title": "Pagination",
					"buttons": [{
						"set_attributes":
						{
							"offset": prevOffset,
							"limit": prevLimit
						},
						"type": "json_plugin_url",
						"url": prevUrl,
						"title": "Page précédente"
					}]
				}
				elements.push(prevElement)
			}
		}
		if(index < limit) {
			interestsCount = gift.dataValues.interestsCount
			subtitle = gift.location
			if(interestsCount > 0) {
				person = interestsCount > 1 ? "intéressés" : "interessé"
				subtitle += "\n" + interestsCount + " 👤 " + person
			}
			element = {
				"title": gift.title,
				"image_url": gift.picture,
				"subtitle": subtitle,
				"buttons": [{
					"set_attributes":
					{
						"selectedGiftId": gift.ID,
					},
					"block_names": ["Modifier Gift"],
					"type": "show_block",
					"title": "Modifier"
				},
				{
					"set_attributes":
					{
						"selectedGiftId": gift.ID,
					},
					"block_names": ["Gift interests list"],
					"type": "show_block",
					"title": "Liste d'intéressés"
				},
				{
					"set_attributes":
					{
						"selectedGiftId": gift.ID,
					},
					"type": "show_block",
					"block_names": ["Retirer de la vente"],
					"title": "Retirer de la vente"
				}]
			}
			elements.push(element)
		}
	}).then(() => {
		if(addNext === true) {
			nextOffset = offset === 0 ? nextOffset = 9 : nextOffset = offset + 8
			nextLimit = 8
			nextUrl = req.protocol + "://" + req.hostname + "/users/" + req.params.id + "/gifts/?offset=" + nextOffset + "&limit=" + nextLimit
			nextElement = {
				"title": "Navigation",
				"buttons": [{
					"set_attributes":
					{
						"offset": nextOffset,
						"limit": nextLimit
					},
					"type": "json_plugin_url",
					"url": nextUrl,
					"title": "Page suivante"
				}]
			}
			elements.push(nextElement)
		}
		if(elements.length > 0) {
			json = {
				"messages": [{
					"attachment": {
						"type": "template",
						"payload": {
							"template_type": "generic",
							"image_aspect_ratio": "square",
							"elements": elements
						}
					}
				}]
			}
		} else {
			json = {
				"messages": [{
					"text": "Tu n'as pas encore de Gifts à proposer 😞"
				}]
			}
		}
		res.send(json)
	})
}

exports.user_gifts_interests = function(req, res) {

	offset = parseInt(req.query.offset)
	limit = parseInt(req.query.limit)

	addNext = false

	owner = {}
	elements = []

	models.Interest.belongsTo(models.User, {foreignKey: 'buyerId'})
	models.Interest.belongsTo(models.Gift, {foreignKey: 'giftId'})

	models.User.findOne({
		where: {
			ID: req.params.id
		}
	}).then(user => {
		owner = user
		return models.Interest.findAll({
			where: {
				ownerId: req.params.id,
				giftId: req.params.giftId
			},
			include: [models.User, models.Gift],
			offset: offset,
			limit: limit + 1,
			order: [['giftId','desc']]
		})
	}).each((interest, index, length) => {
		if(index === 0) {
			if(length > limit) {
				addNext = true
			}
			if(offset > 0) {
				prevOffset = offset == 9 ? prevOffset = 0 : prevOffset = offset - 8
				prevLimit = offset == 9 ? prevLimit = 9 : prevLimit = 8
				prevUrl = req.protocol + "://" + req.hostname + "/users/" + req.params.id + "/gifts/" + req.params.giftId + "?offset=" + prevOffset + "&limit=" + prevLimit
				prevElement = {
					"title": "Pagination",
					"buttons": [{
						"type": "json_plugin_url",
						"url": prevUrl,
						"title": "Page précédente"
					}]
				}
				elements.push(prevElement)
			}
			if(limit > length) {
				limit = length
			}
		}
		if(index < limit) {
			title = interest.user.firstName + " est intéressé par ton annonce"
			element = {
				"title": title,
				"image_url": interest.user.profilePicUrl,
				"subtitle": interest.gift.title,
				"buttons": [{
					"set_attributes":
					{
						"actionedGiftId": interest.gift.ID,
					},
					"block_names": ["Accepter"],
					"type": "show_block",
					"title": "✅  Accepter"
				},
				{
					"set_attributes":
					{
						"actionedGiftId": interest.gift.ID, // buyerId
					},
					"block_names": ["Refuser"],
					"type": "show_block",
					"title": "🚫 Refuser"
				},
				{
					"set_attributes":
					{
						"msgRecipient": interest.user.uid,
					},
					"type": "show_block",
					"block_names": ["Send Message"],
					"title": "Envoyer un message"
				}]
			}
			elements.push(element)
		}
	}).then(() => {
		if(addNext === true) {
			nextOffset = offset === 0 ? nextOffset = 9 : nextOffset = offset + 8
			nextLimit = 8
			nextUrl = req.protocol + "://" + req.hostname + "/users/" + req.params.id + "/gifts/" + giftId + "interests?offset=" + nextOffset + "&limit=" + nextLimit
			nextElement = {
				"title": "Navigation",
				"buttons": [{
					"type": "json_plugin_url",
					"url": nextUrl,
					"title": "Page suivante"
				}]
			}
			elements.push(nextElement)
		}
		if(elements.length > 0) {
			json = {
				"messages": [{
					"attachment": {
						"type": "template",
						"payload": {
							"template_type": "generic",
							"image_aspect_ratio": "square",
							"elements": elements
						}
					}
				},{
					"quick_replies": [
						{
							"title": "Retour",
							"block_names": ["Liste de mes Gifts"]
						}
					],
				}]
			}
		} else {
			json = {
				"messages": [{
					"text": "Il n'y a pas encore d'intérêts pour ce Gift 😞"
				}]
			}
		}
		res.send(json)
	})
}
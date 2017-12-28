const models = require('../models')
const sequelize = require('sequelize')

exports.index = function(req, res, next) {
	
	offset = parseInt(req.query.offset)
	limit = parseInt(req.query.limit)
	buyerId = parseInt(req.query.buyerId)
	include = []

	addNext = false
	elements = []

	models.Gift.hasMany(models.Interest, {foreignKey: 'giftId'})

	if(buyerId) {
		include = [{
			"model": models.Interest, "where": {"buyerId": buyerId}
		}]
	}

	models.Gift.findAll({
		limit: limit + 1,
		offset: offset,
		order: [['ID', 'desc']],
		include: include,
	}).each((gift, index, length) => {
		if(index == 0) {
			if(length > limit) {
				addNext = true
			}
			if(offset > 0) {
				prevOffset = offset == 9 ? prevOffset = 0 : prevOffset = offset - 8
				prevLimit = offset == 9 ? prevLimit = 9 : prevLimit = 8
				prevUrl = req.protocol + "://" + req.hostname + "/gifts/?offset=" + prevOffset + "&limit=" + prevLimit + "&buyerId=" + buyerId
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
		}
		if(index < limit) {
			url = req.protocol + "://" + req.hostname + "/gifts/" + gift.ID + "/description"
			contactUrl = req.protocol + "://" + req.hostname + "/gifts/" + gift.ID + "/vendor"
			element = {
				"title": gift.title,
				"image_url": gift.picture,
				"subtitle": gift.location,
				"buttons": [{
					"set_attributes":
					{
						"selectedGiftId": gift.ID,
					},
					"url": contactUrl,
					"type": "json_plugin_url",
					"title": "Intéressé"
				},
				{
					"set_attributes":
					{
						"selectedGiftId": gift.ID,
					},
					"type": "json_plugin_url",
					"url": url,
					"title": "Voir la description"
				},
				{
					"type":"element_share",
				}]
			}
			elements.push(element)
		}
	}).then(() => {
		if(addNext == true) {
			nextOffset = offset == 0 ? nextOffset = 9 : nextOffset = offset + 8
			nextLimit = 8
			nextUrl = req.protocol + "://" + req.hostname + "/gifts/?offset=" + nextOffset + "&limit=" + nextLimit + "&buyerId=" + buyerId
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
				}]
			}
		} else {
			json = {
				"messages": [{
					"text": "Je n'ai trouvé aucun Gift 😞"
				}]
			}
		}
		res.send(json)
	})
}

exports.gift_description = function(req, res) {
	models.Gift.findOne({
		where: {
			ID: req.params.id,
		}
	}).then(gift => {
		json = {
			"messages": [{
				"attachment": {
					"type": "template",
					"payload": {
						"template_type": "button",
						"text": gift.description,
						"buttons": [{
							"title": "Contacter le vendeur",
							"type": "show_block",
							"block_names": ["Contacter le vendeur"],
						},
						{
							"title": "Acheter",
							"type": "show_block",
							"block_names": ["Acheter"],
						}]
					}
				}
			}]
		}
		res.send(json)
	})
}


exports.gift_selection = function(req, res) {
	models.Gift.findOne({
		where: {
			ID: req.params.id,
		}
	}).then(gift => {
		models.User.findOne({
			where: {
				ID: gift.owner,
			}
		}).then(vendor => {
			json = {
				"messages": [{
					"attachment": {
						"type": "template",
						"payload": {
							"template_type": "generic",
							"image_aspect_ratio": "square",
							"elements": [{
								"title": vendor.firstName,
								"subtitle": gift.title,
								"image_url": vendor.profilePicUrl,
								"buttons": [{
									"title": "Contacter le vendeur",
									"type": "show_block",
									"block_names": ["Contacter le vendeur"],
								},
								{
									"title": "Acheter",
									"type": "show_block",
									"block_names": ["Acheter"],
								}]
							}]
						}
					}
				}]
			}
			res.send(json)
		})
	})
}
const models = require('../models')

exports.index = function(req, res, next) {
	
	offset = parseInt(req.query.offset)
	limit = parseInt(req.query.limit)

	addNext = false

	models.Gift.findAll({
		offset: offset,
		limit: limit + 1
	}).then(result => {
		if(result.length > limit) {
			addNext = true
		}
	})

	models.Gift.findAll({
		limit: limit,
		offset: offset,
		order: [
		['ID', 'asc'],
		]
	}).then(gifts => {
		elements = []

		if(offset > 0) {
			prevOffset = offset == 9 ? prevOffset = 0 : prevOffset = offset - 8
			prevLimit = offset == 9 ? prevLimit = 9 : prevLimit = 8
			prevUrl = req.protocol + "://" + req.hostname + "/gifts/?offset=" + prevOffset + "&limit=" + prevLimit
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

		gifts.forEach(function(gift) {
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
		})
		if(addNext == true) {
			nextOffset = offset == 0 ? nextOffset = 9 : nextOffset = offset + 8
			nextLimit = 8
			nextUrl = req.protocol + "://" + req.hostname + "/gifts/?offset=" + nextOffset + "&limit=" + nextLimit
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
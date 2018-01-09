const models = require('../models')
const sequelize = require('sequelize')
const utils = require('../helpers/utils')

exports.index = function(req, res, next) {
	
	addNext = false
	elements = []

	models.Gift.hasMany(models.Interest, {foreignKey: 'giftId'})

	queryParams = {
		order: [['ID', 'desc']]
	}

	if(req.query.dbUid) {
		queryParams.include = [{
			model: models.Interest, "where": {"buyerId": parseInt(req.query.dbUid)}
		}]
	}
	
	if(req.query.offset) {
		queryParams.offset = parseInt(req.query.offset)
	}

	if(req.query.limit) {
		queryParams.limit = parseInt(req.query.limit) + 1 // limit increment is used for the 'next' pagination page display condition
	}

	offset = queryParams.offset
	limit = queryParams.limit

	models.Gift.findAll(queryParams).each((gift, index, length) => {
		if(index == 0 && typeof limit !== 'undefined') {
			if(length > limit) {
				addNext = true
			}
			if(typeof offset !== 'undefined' && offset > 0) {
				prevOffset = offset == 9 ? prevOffset = 0 : prevOffset = offset - 8
				prevLimit = offset == 9 ? prevLimit = 9 : prevLimit = 8
				prevUrl = req.protocol + "://" + req.hostname + "/gifts/?offset=" + prevOffset + "&limit=" + prevLimit + "&buyerId=" + buyerId
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
		if(typeof limit === 'undefined' || index < limit) {
			descriptionUrl = req.protocol + "://" + req.hostname + "/gifts/" + gift.ID + "/description"
			vendorUrl = req.protocol + "://" + req.hostname + "/gifts/" + gift.ID + "/vendor"
			title = gift.title + ' ' + utils.getFormattedPrice(gift.price, null)
			element = {
				"title": title,
				"image_url": gift.picture,
				"subtitle": gift.location,
				"buttons": [{
					"set_attributes":
					{
						"selectedGiftId": gift.ID,
					},
					"url": vendorUrl,
					"type": "json_plugin_url",
					"title": "Intéressé"
				},
				{
					"set_attributes":
					{
						"selectedGiftId": gift.ID,
					},
					"type": "json_plugin_url",
					"url": descriptionUrl,
					"title": "Voir la description"
				},
				{
					"type":"element_share",
				}]
			}
			elements.push(element)
		}
	}).then(() => {
		if(addNext == true && typeof offset !== 'undefined') {
			nextOffset = offset == 0 ? nextOffset = 9 : nextOffset = offset + 8
			nextLimit = 8
			nextUrl = req.protocol + "://" + req.hostname + "/gifts/?offset=" + nextOffset + "&limit=" + nextLimit + "&buyerId=" + buyerId
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
					},
					"quick_replies": [
						{
							"title": "Retour au menu",
							"block_names": ["Mon compte"]
						}
					]
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
			subtitle = gift.title + ' ' + utils.getFormattedPrice(gift.price, null)
			json = {
				"messages": [{
					"attachment": {
						"type": "template",
						"payload": {
							"template_type": "generic",
							"image_aspect_ratio": "square",
							"elements": [{
								"title": vendor.firstName,
								"subtitle": subtitle,
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

exports.gift_search = function(req, res) {

	searchTerms = []
	queryString = ''
	if(req.query.searchKey1 != undefined) {
		searchTerms.push(req.query.searchKey1)
	}
	if(req.query.searchKey2 != undefined) {
		searchTerms.push(req.query.searchKey2)
	}
	if(req.query.searchKey2 != undefined) {
		searchTerms.push(req.query.searchKey2)
	}

	searchTerms.forEach( term => {
		queryString += term + ' '
	})

	from_lat = req.query.searchLatitude
	from_long = req.query.searchLongitude
	searchRange = req.query.searchRange
	owner = req.query.dbUid

	radius = parseInt(searchRange.split(' ')[0])*1000

	offset = parseInt(req.query.offset)
	limit = parseInt(req.query.limit)

	addNext = false
	elements = []

	models.Gift.search(queryString.trim(), owner, from_lat, from_long, radius, offset, limit + 1).each((gift, index, length) => {
		if(index == 0) {
			if(length > limit) {
				addNext = true
			}
			if(offset > 0) {
				prevOffset = offset == 9 ? prevOffset = 0 : prevOffset = offset - 8
				prevLimit = offset == 9 ? prevLimit = 9 : prevLimit = 8
				prevUrl = req.protocol + "://" + req.hostname + "/gifts/search?query=" + queryString + "&offset=" + prevOffset + "&limit=" + prevLimit
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
			descriptionUrl = req.protocol + "://" + req.hostname + "/gifts/" + gift.ID + "/description"
			vendorUrl = req.protocol + "://" + req.hostname + "/gifts/" + gift.ID + "/vendor"
			location = gift.location + "\n" + Number(Math.round(gift.dataValues.distance/1000+'e1')+'e-1') + " km"
			title = gift.title + ' ' + utils.getFormattedPrice(gift.price, null)
			element = {
				"title": title,
				"image_url": gift.picture,
				"subtitle": location,
				"buttons": [{
					"set_attributes":
					{
						"selectedGiftId": gift.ID,
					},
					"url": vendorUrl,
					"type": "json_plugin_url",
					"title": "Intéressé"
				},
				{
					"set_attributes":
					{
						"selectedGiftId": gift.ID,
					},
					"type": "json_plugin_url",
					"url": descriptionUrl,
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
			nextUrl = req.protocol + "://" + req.hostname + "/gifts/search?query=" + queryString + "&offset=" + nextOffset + "&limit=" + nextLimit
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
			s = elements.length > 1 ? "s" : ""
			json = {
				"messages": [{
					"text": elements.length + " Gift" + s + " trouvé" + s,
				},
				{
					"attachment": {
						"type": "template",
						"payload": {
							"template_type": "generic",
							"image_aspect_ratio": "square",
							"elements": elements
						}
					},
					"quick_replies": [
						{
							"title": "Options de recherche",
							"block_names": ["Chercher un Gift"]
						}
					]
				}]
			}
		} else {
			json = {
				"messages": [{
					"attachment": {
						"type": "template",
						"payload": {
							"template_type": "button",
							"text": "Je n'ai trouvé aucun Gifts 😞\nJe te propose de parcourir les derniers Gifts ajoutés.",
							"buttons": [
							{
								"type": "show_block",
								"block_names": ["Derniers Gifts"],
								"title": "Afficher"
							}]
						}
					}
				}]
			}
		}
		res.send(json)
	})
}


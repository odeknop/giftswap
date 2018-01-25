const path = require('path');
const utils = require('../helpers/utils')

exports.index = function(req, res) {
	res.sendFile(path.join(__basedir,'views', 'index.html'))
}

exports.preview = function(req, res, next) {
	if(!req.query.giftTitle || !req.query.giftPicture || !req.query.giftPrice || !req.query.giftLocation) {
		return res.status(400).send({error: "Bad Request - Your request is missing parameters. Please verify and resubmit."})
	}
	title = req.query.giftTitle + ' ' + utils.getFormattedPrice(req.query.giftPrice)
	preview = {
		"messages": [{
			"attachment": {
				"type": "template",
				"payload": {
					"template_type": "generic",
					"image_aspect_ratio": "square",
					"elements": [{
						"title": title,
						"image_url": req.query.giftPicture,
						"subtitle": req.query.giftLocation,
						"buttons": [{
							"type": "show_block",
							"block_names": ["Gift preview description"],
							"title": "Voir la description"
						},
						{
							"type": "show_block",
							"block_names": ["Publier"],
							"title": "Publier"
						},
						{
							"type": "show_block",
							"block_names": ["Vendre un gift"],
							"title": "Retour"
						}]
					}]
				}
			}
		}]
	}
	return res.send(preview)
}

exports.preview_edited_gift = function(req, res, next) {
	if(!req.query.editGiftTitle || !req.query.editGiftPicture || !req.query.editGiftPrice || !req.query.editGiftLocation) {
		return res.status(400).send({error: "Bad Request - Your request is missing parameters. Please verify and resubmit."})
	}
	title = req.query.editGiftTitle + ' ' + utils.getFormattedPrice(req.query.editGiftPrice)
	preview = {
		"messages": [{
			"attachment": {
				"type": "template",
				"payload": {
					"template_type": "generic",
					"image_aspect_ratio": "square",
					"elements": [{
						"title": title,
						"image_url": req.query.editGiftPicture,
						"subtitle": req.query.editGiftLocation,
						"buttons": [{
							"type": "show_block",
							"block_names": ["Edit Gift preview description"],
							"title": "Voir la description"
						},
						{
							"type": "show_block",
							"block_names": ["Update Gift"],
							"title": "Update Gift"
						},
						{
							"type": "show_block",
							"block_names": ["Edit Gift Menu"],
							"title": "Retour"
						}]
					}]
				}
			}
		}]
	}
	return res.send(preview)
}

exports.test = function(req, res, next) {
	test = {
		"messages": [{
			"attachment": {
				"type": "template",
				"payload": {
					"template_type": "button",
					"text": "hello",
					"buttons": [{
						"type": "show_block",
						"block_names": ["Block name"],
						"title": "My button"
					}]
				}
			},
			"quick_replies": [{
				"title": "my QR1",
				"block_names": ["QR1"]
			},
			{
				"title": "my QR2",
				"block_names": ["QR2"]
			}]
		}]
	}
	return res.send(test)
}
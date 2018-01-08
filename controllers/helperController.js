var path = require('path');

exports.index = function(req, res) {
	res.sendFile(path.join(__basedir,'views', 'index.html'))
}

exports.preview = function(req, res, next) {
	if(!req.query.giftTitle && !req.query.giftEditTitle) {
		return res.status(400).send({error: "Bad Request - Your request is missing parameters. Please verify and resubmit."})
	}
	if(req.query.giftTitle && req.query.giftEditTitle) {
		return res.status(400).send({error: "Bad Request - Your request has wrong parameters. Please verify and resubmit."})
	}

	if(req.query.giftTitle) {
		giftTitle = req.query.giftTitle + ' ' + req.query.giftPriceFormatted
	} else {
		giftTitle = req.query.giftEditTitle + ' ' + req.query.giftPriceFormatted
	}
	preview = {
		"messages": [{
			"attachment": {
				"type": "template",
				"payload": {
					"template_type": "generic",
					"image_aspect_ratio": "square",
					"elements": [{
						"title": giftTitle,
						"image_url": req.query.giftPicture,
						"subtitle": req.query.giftLocation,
						"buttons": [{
							"type": "show_block",
							"block_names": ["Gift preview description"],
							"title": "Voir la description"
						},
						{
							"type": "show_block",
							"block_names": ["Vendre un gift"],
							"title": "Modifier"
						},
						{
							"type": "show_block",
							"block_names": ["Publier"],
							"title": "Publier"
						}]
					}]
				}
			}
		}]
	}
	return res.send(preview)
}
var path = require('path');

exports.index = function(req, res) {
	res.sendFile(path.join(__basedir,'views', 'index.html'))
}

exports.preview = function(req, res) {
	giftTitle = req.query.giftTitle + ' ' + req.query.giftPriceFormatted
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
	res.send(preview)
}
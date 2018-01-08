module.exports = {
	
	encodeQueryData: function(data) {
		let ret = []
		for (let d in data)
			ret.push(encodeURIComponent(d) + '=' + encodeURIComponent(data[d]))
		return ret.join('&')
	},
	getFormattedPrice(price, locale) {
		return price + ' €'
	},

}
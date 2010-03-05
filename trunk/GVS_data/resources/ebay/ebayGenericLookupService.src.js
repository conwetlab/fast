search: function (item){
	var parameters = {
			'callname': 'GetSingleItem',
			'version': '515',
			'responseencoding': 'XML',
			'appid': 'eBayAPID-73f4-45f2-b9a3-c8f6388b38d8',
			'callback': 'true',
			'ItemID': item.data.id
	};
	
	var url = 'http://open.api.ebay.com/shopping?' + Object.toQueryString(parameters);

    new FastAPI.Request(url,{
        'method':       'get',
        'content':      'xml',
        'context':      this,
        'onSuccess':    this.createItem.bind(this)
    });
},

createItem: function (transport){
	var it = {id: 'item', data: {'source': 'eBay', 'details':{}}};
	var item = transport.getElementsByTagName("Item")[0];
	if (item.getElementsByTagName("ItemID").length > 0) {
		it.data.itemID = item.getElementsByTagName("ItemID")[0].firstChild.nodeValue;
	}
	if (item.getElementsByTagName("Title").length > 0) {
		it.data.title = item.getElementsByTagName("Title")[0].firstChild.nodeValue;
	}
	if (item.getElementsByTagName("PrimaryCategoryName").length > 0) {
		it.data.type = item.getElementsByTagName("PrimaryCategoryName")[0].firstChild.nodeValue;
	}
	if (item.getElementsByTagName("ConvertedCurrentPrice").length > 0) {
		var price = item.getElementsByTagName("ConvertedCurrentPrice")[0];
		var currency = price.getAttribute("currencyID");
		it.data.currentPrice = price.firstChild.nodeValue + " " + currency;
	}
	if (item.getElementsByTagName("GalleryURL").length > 0) {
		it.data.image = item.getElementsByTagName("GalleryURL")[0].firstChild.nodeValue;
	}
	if (item.getElementsByTagName("ViewItemURLForNaturalSearch").length > 0) {
		it.data.url = item.getElementsByTagName("ViewItemURLForNaturalSearch")[0].firstChild.nodeValue;
	}
	
	if (item.getElementsByTagName("ShippingServiceCost").length > 0) {
		it.data.details.shipping = item.getElementsByTagName("ShippingServiceCost")[0].firstChild.nodeValue;
	}
	if (item.getElementsByTagName("Location").length > 0) {
		it.data.details.location = item.getElementsByTagName("Location")[0].firstChild.nodeValue;
	}
	if (item.getElementsByTagName("BidCount").length > 0) {
		it.data.details.bidcount = item.getElementsByTagName("BidCount")[0].firstChild.nodeValue;
	}
	if (item.getElementsByTagName("FeedbackScore").length > 0) {
		it.data.details.feedbackscore = item.getElementsByTagName("FeedbackScore")[0].firstChild.nodeValue;
	}
	if (item.getElementsByTagName("Quantity").length > 0) {
		it.data.details.quantity = item.getElementsByTagName("Quantity")[0].firstChild.nodeValue;
	}
	this.manageData(["newItem"], [it], []);
},

onError: function (transport){}
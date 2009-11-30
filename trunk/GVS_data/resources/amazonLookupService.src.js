searchProduct: function (item){
	//Base URL of the REST Service
	var url = "http://webservices.amazon.com/onca/xml?Service=AWSECommerceService";
	//Add the operation Type
	url +="&Operation=ItemLookup";
	//Add the responseGroup
	url +="&ResponseGroup=Medium";
	//Add the current version of the API
	url += "&Version=2008-06-26";
	//Add item ID
	url += "&ItemId=" + item.data.ASIN;
	
	var encoder = new URLAmazonEncoder();
	url = encoder.encode(url);

	//Invoke the service
	new FastAPI.Request(url,{
        'method':       'get',
        'content':      'xml',
        'context':      this,
        'onSuccess':    this.fetchProductInfo.bind(this)
    });
},

fetchProductInfo: function (transport){
	var xml = transport;
	var item = xml.getElementsByTagName("Item")[0];
	if (item.getElementsByTagName("Title").length > 0) {
		var title = item.getElementsByTagName("Title")[0].firstChild.nodeValue;
	}
	if (item.getElementsByTagName("FormattedPrice").length > 0) {
        var price = item.getElementsByTagName("FormattedPrice")[0].firstChild.nodeValue;
	}
	if (item.getElementsByTagName("ProductGroup").length > 0) {
        var pGroup = item.getElementsByTagName("ProductGroup")[0].firstChild.nodeValue;
	}
    if (item.getElementsByTagName("DetailPageURL").length > 0) {
        var url = item.getElementsByTagName("DetailPageURL")[0].firstChild.nodeValue;
    }
    if (item.getElementsByTagName("MediumImage").length > 0) {
        var image = item.getElementsByTagName("MediumImage")[0].getElementsByTagName("URL")[0].firstChild.nodeValue;
    }
    var _product = {
		id: "product",
		data:{title: title,
			price: price,
			item: item,
			pGroup: pGroup,
			url: url,
			image: image}
	};

    this.manageData(["newProduct"], [_product], []);	
},

onError: function (transport){}
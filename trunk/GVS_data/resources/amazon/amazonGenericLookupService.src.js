search: function (item){
	var parameters = {
			'Operation': 'ItemLookup',
			'ResponseGroup': 'Large',
			'Version': '2008-06-26',
			'ItemId': item.data.id
	};
	
	var url = 'http://webservices.amazon.com/onca/xml?Service=AWSECommerceService&' + Object.toQueryString(parameters);
    
	var encoder = new URLAmazonEncoder();
	url = encoder.encode(url);

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
	if (item.getElementsByTagName("ASIN").length > 0) {
		var ASIN = item.getElementsByTagName("ASIN")[0].firstChild.nodeValue;
	}
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
    if (item.getElementsByTagName("LargeImage").length > 0) {
        var image = item.getElementsByTagName("LargeImage")[0].getElementsByTagName("URL")[0].firstChild.nodeValue;
    }
    var _item = {
		id: "item",
		data:{
            source: "Amazon",
            title: title,
            price: price,
            type: pGroup,
            id: ASIN,
            url: url,
            image: image
        }
	};

    var elementList = ["Model",
						"Color",
						"Label",
						"Binding",
						"ReleaseDate",
						"Feature"];
    switch (pGroup){
		case "eBooks":
		case "Book":
			elementList = ["Author",
						   "PublicationDate",
						   "ISBN",
						   "Format",
						   "Label",
						   "NumberOfPages"];	
			break;
		case "Theatrical Release":
		case "Video":
		case "DVD":
			elementList = ["Actor",
						   "Director",
						   "Genre",
						   "RunningTime",
						   "AudienceRating",
						   "Label",
						   "Binding",
						   "Brand",
						   "Region",
						   "AspectRatio",
						   "OriginalReleaseDate",
						   "Format"];
			break;
		case "Digital Music Track":
		case "Music":
			elementList = 	["Artist",
							"Genre",
							"Label",
							"Brand",
							"Binding",
							"Format",
							"NumberOfDiscs",
							"ReleaseDate",
							"OriginalReleaseDate"];
			break;
		case "Photography":
			elementList = ["Brand","Model","Feature"];
			break;
		case "Personal Computer":
			elementList = 	["Model",
							"Label",
							"Binding",
							"CPUType",
							"CPUSpeed",
							"DisplaySize",
							"HardDiskSize",
							"DataLinkProtocol",
							"FloppyDiskDriveDescription",
							"SystemMemorySize",
							"SystemMemoryType",
							"HardwarePlatform",
							"OperatingSystem",
							"ReleaseDate",
							"Warranty",
							"LegalDisclaimer",
							"Feature",
							"SpecialFeatures"];
			break;
		case "CE":
		case "Video Games":						
		case "Software":
		case "Wireless":
		case "Wireless Phone Accessory":
			elementList = 	["Model",
							"Color",
							"Label",
							"Binding",
							"DisplaySize",
							"ESRBAgeRating", 
							"HardwarePlatform", 
							"OperatingSystem", 
							"ReleaseDate",
							"LegalDisclaimer",
							"Feature",
							"SpecialFeatures"];
			break;	
	}
    
	_item.data.details = this.getDetails(item, elementList);
    this.manageData(["newItem"], [_item], []);	
},

getDetails: function (item, atributeList){
	var details = {};
	for (var i=0; i < atributeList.length; i++){
		var elements = item.getElementsByTagName(atributeList[i]);
		if (elements.length == 1) {
			details[atributeList[i]] = elements[0].firstChild.nodeValue;
    	} else if (elements.length > 1){
    		details[atributeList[i]] = new Array();
    		for (var j=0; j < elements.length; j++){
    			details[atributeList[i]].push(elements[j].firstChild.nodeValue);
	    	}
    	}
	}
	return details;
},

onError: function (transport){}
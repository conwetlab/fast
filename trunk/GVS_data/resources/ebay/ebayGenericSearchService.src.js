search: function (filter){
	
	var pageNumber = (filter.data.pageNumber)? filter.data.pageNumber : 1;
	
	var parameters = {
			'callname': 'FindItemsAdvanced',
			'ItemSort': 'BestMatch',
			'version': '515',
			'responseencoding': 'XML',
			'appid': 'eBayAPID-73f4-45f2-b9a3-c8f6388b38d8',
			'callback': 'true',
			'MaxEntries': '10',
			'PageNumber': pageNumber,
			'QueryKeywords': filter.data.keywords
	};
	
	var url = 'http://open.api.ebay.com/shopping?' + Object.toQueryString(parameters);

    new FastAPI.Request(url,{
        'method':       'get',
        'content':      'xml',
        'context':      this,
        'onSuccess':    this.addToList.bind(this)
    });
},

addToList: function (transport){
	var eBayList = {id: 'list', data:new Array()};
    var items = transport.getElementsByTagName("Item");
    $A(items).each(function(item){
    	var row = {source: 'eBay'};
    	
		if (item.getElementsByTagName("ItemID").length > 0) {
			row.id = item.getElementsByTagName("ItemID")[0].firstChild.nodeValue;
		}
		if (item.getElementsByTagName("Title").length > 0) {
			row.title = item.getElementsByTagName("Title")[0].firstChild.nodeValue;
		}
		if (item.getElementsByTagName("PrimaryCategoryName").length > 0) {
			row.type = item.getElementsByTagName("PrimaryCategoryName")[0].firstChild.nodeValue;
		}
		if (item.getElementsByTagName("ConvertedCurrentPrice").length > 0) {
			var price = item.getElementsByTagName("ConvertedCurrentPrice")[0];
			var currency = price.getAttribute("currencyID");
			row.price = price.firstChild.nodeValue + " " + currency;
		}
		if (item.getElementsByTagName("GalleryURL").length > 0) {
			row.image = item.getElementsByTagName("GalleryURL")[0].firstChild.nodeValue;
		}
		if (item.getElementsByTagName("ViewItemURLForNaturalSearch").length > 0) {
			row.url = item.getElementsByTagName("ViewItemURLForNaturalSearch")[0].firstChild.nodeValue;
		}
		 
        eBayList.data.push(row);
     });
     this.manageData(["itemList"], [eBayList], []);
},

onError: function (transport){}
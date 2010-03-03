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

	//Invoke the service
    new FastAPI.Request(url,{
        'method':       'get',
        'content':      'xml',
        'context':      this,
        'onSuccess':    function (transport){this.addToList(transport, filter)}.bind(this)
    });
},

addToList: function (transport, filter){
	var eBayList = {id: 'list', data:new Array()};
	var xml = transport;
    var items = xml.getElementsByTagName("Item");
    //Fill the table, 1 row per item
    $A(items).each(function(item){
         if (item.getElementsByTagName("ItemID").length > 0) {
         	var itemID = item.getElementsByTagName("ItemID")[0].firstChild.nodeValue;
         } else {
			var itemID = "&nbsp;";
         }
         if (item.getElementsByTagName("Title").length > 0) {
         	var title = item.getElementsByTagName("Title")[0].firstChild.nodeValue;
		 } else {
			var title = "&nbsp;";
		 }
		 if (item.getElementsByTagName("PrimaryCategoryName").length > 0) {
         	var category = item.getElementsByTagName("PrimaryCategoryName")[0].firstChild.nodeValue;
		 } else {
			var category = "&nbsp;";
		 }
		 if (item.getElementsByTagName("ConvertedCurrentPrice").length > 0) {
         	var currentPrice = '$' + item.getElementsByTagName("ConvertedCurrentPrice")[0].firstChild.nodeValue;
		 } else {
			var currentPrice = "&nbsp;";
		 }
		 if (item.getElementsByTagName("GalleryURL").length > 0) {
             var image = item.getElementsByTagName("GalleryURL")[0].firstChild.nodeValue;
		 } else {
         	var image = "";
		 }
		 if (item.getElementsByTagName("ViewItemURLForNaturalSearch").length > 0) {
             var url = item.getElementsByTagName("ViewItemURLForNaturalSearch")[0].firstChild.nodeValue;
		 } else {
         	var url = "";
		 }
		 var row = {
			 source: 'eBay',
         	 id: itemID,
             title:  title.replace(/\x27/g,"`"),
             type: category,
             price: currentPrice,
             image: image,
             url: url
         };
         eBayList.data.push(row);
     });
     this.manageData(["itemList"], [eBayList], []);
},

onError: function (transport){}
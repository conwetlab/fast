fetch: function (filter){
	//URL of the Service
	var url = "http://open.api.ebay.com/shopping?";
	url += "&callname=FindItemsAdvanced";
	url += "&ItemSort=BestMatch";
	url += "&version=515";
	url += "&responseencoding=XML";
	url += "&appid=eBayAPID-73f4-45f2-b9a3-c8f6388b38d8";
	url += "&callback=true";
	url += "&MaxEntries=" + filter.data.maxEntries;
	url += "&PageNumber=" + filter.data.currentPage;
	url += "&QueryKeywords=" + escape(filter.data.keywords.replace(/ /g,"+"));

	//Invoke the service
    new FastAPI.Request(url,{
        'method':       'get',
        'content':      'xml',
        'context':      this.context,
        'onSuccess':    function (transport){this.addToList(transport, filter)}.bind(this)
    });
},

addToList: function (transport, filter){
	var eBayList = {id: 'list', data:{productList: new Array()}};
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
		 if (item.getElementsByTagName("ShippingServiceCost").length > 0) {
         	var shippingServiceCost = '$' + item.getElementsByTagName("ShippingServiceCost")[0].firstChild.nodeValue;
		 } else {
			var shippingServiceCost = "&nbsp;";
		 }
		 if (item.getElementsByTagName("GalleryURL").length > 0) {
             var image = item.getElementsByTagName("GalleryURL")[0].firstChild.nodeValue;
		 } else {
         	var image = "";
		 }
		 var row = {
         	 itemID: itemID,
             title:  title.replace(/\x27/g,"`"),
             category: category,
             currentPrice: currentPrice,
             shippingServiceCost: shippingServiceCost,
             image: image
         };
         eBayList.data.productList.push(row);
     });
     if (xml.getElementsByTagName("TotalPages").length > 0) {
        eBayList.data.totalPages = xml.getElementsByTagName("TotalPages")[0].firstChild.nodeValue;
     } else {
		eBayList.data.totalPages = 0;
     }
     if (xml.getElementsByTagName("PageNumber").length > 0) {
         eBayList.data.currentPage = xml.getElementsByTagName("PageNumber")[0].firstChild.nodeValue;
     } else {
		eBayList.data.currentPage = 0;
     }
     eBayList.data.keywords = filter.data.keywords;
     eBayList.data.maxEntries = filter.data.maxEntries;
     this.manageData(["productList"], [eBayList], []);
},

onError: function (transport){}
search: function (filter){
	//Add the ItemSearch parameters
    var productType = filter.data.productType;
    if (!productType) {
        productType = 'All'
    }
    if (!filter.data.currentPage) {
    	filter.data.currentPage = 1;
    }
    var parameters = "";
    parameters += "&SearchIndex=" + productType;
    parameters += "&Keywords=" + encodeURIComponent(filter.data.searchText);
    //Add the page number (if is set)
    parameters += "&ItemPage=" + (filter.data.currentPage);
    //Base URL of the REST Service
    var url = "http://webservices.amazon.com/onca/xml?Service=AWSECommerceService";
    //Add the operation Type
    url +="&Operation=ItemSearch";
    //Add the parameters
    url += parameters;
    //Add the responseGroup
    url +="&ResponseGroup=Medium";
    //Add the current version of the API
    url += "&Version=2008-06-26";
    
    var encoder = new URLAmazonEncoder();
    encodedUrl = encoder.encode(url);
    
    //Invoke the service
    new FastAPI.Request(encodedUrl,{
        'method':       'get',
        'content':      'xml',
        'context':      this,
        'onSuccess':    this.addToList.bind(this)
    });
},

addToList: function (transport){
	var l = {id: 'list', data: {productList: new Array(), currentPage: 1, totalResults: 0, totalPages: 0}};
	var xml = transport;
    //Check if the service returned an error
    if (xml.getElementsByTagName("IsValid")[0].childNodes[0].nodeValue == "False") {
        var message = {id: 'message', data:{message: xml.getElementsByTagName("Message")[0].childNodes[0].nodeValue}};
        this.manageData(["message"], [message],[]);
    } else {
        //Correct response, create the result List
        var _list = xml.getElementsByTagName("Items")[0].getElementsByTagName("Item");
        //Fill the table, 1 row per item
        $A(_list).each(function(item){
            if (item.getElementsByTagName("Title").length > 0) {
                var title = item.getElementsByTagName("Title")[0].firstChild.nodeValue;
            } else {
                var title = "&nbsp;";
            }
            if (item.getElementsByTagName("FormattedPrice").length > 0) {
                var price = item.getElementsByTagName("FormattedPrice")[0].firstChild.nodeValue;
            } else {
                var price = "&nbsp;";
            }
            if (item.getElementsByTagName("ProductGroup").length > 0) {
                var pGroup = item.getElementsByTagName("ProductGroup")[0].firstChild.nodeValue;
            } else {
                var pGroup = "&nbsp;";
            }
            if (item.getElementsByTagName("ASIN").length > 0) {
                var ASIN = item.getElementsByTagName("ASIN")[0].firstChild.nodeValue;
            }
            var row = {
                title: title,
                price: price,
                pGroup: pGroup,
                ASIN: ASIN
            };
            l.data.productList.push(row);
        });
        
        l.data.totalPages = parseInt(xml.getElementsByTagName("TotalPages")[0].firstChild.nodeValue);
        l.data.totalResults = parseInt(xml.getElementsByTagName("TotalResults")[0].firstChild.nodeValue);
        if (l.data.totalPages < 0) {
        	l.data.totalPages = 0;
        }
        l.data.currentPage = parseInt(xml.getElementsByTagName("ItemPage")[0].childNodes[0].nodeValue);
        l.data.searchText = xml.getElementsByTagName("Keywords")[0].childNodes[0].nodeValue;
        l.data.productType = xml.getElementsByTagName("SearchIndex")[0].childNodes[0].nodeValue;
        this.manageData(["itemList"], [l], []);
    }
},

onError: function (transport){}
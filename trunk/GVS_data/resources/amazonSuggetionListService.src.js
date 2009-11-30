fetch: function (item){
	//Add the ItemSearch parameters
    var parameters = "";
	parameters += "&ItemId=" + item.data.ASIN;
    
    //Base URL of the REST Service
	var url = "http://webservices.amazon.com/onca/xml?Service=AWSECommerceService";
	//Add the operation Type
	url +="&Operation=SimilarityLookup";
	//Add the parameters
	url += parameters;
	//Add the responseGroup
	url +="&ResponseGroup=Medium";
	//Add the current version of the API
	url += "&Version=2008-06-26";
	
	var encoder = new URLAmazonEncoder();
	url = encoder.encode(url);

	//Invoke the service
    new FastAPI.Request(url,{
        'method':       'get',
        'content':      'xml',
        'context':      this,
        'onSuccess':    this.addToList.bind(this)
    });
},

addToList: function (transport){
	var suggestionList = {id: 'list', data:{productList: new Array(), currentPage: 0}};
    var xml = transport;
    //Check if the service returned an error
    if (xml.getElementsByTagName("IsValid")[0].childNodes[0].nodeValue == "False") {
    	var message = {id: "message", data:{message: xml.getElementsByTagName("Message")[0].childNodes[0].nodeValue}};
    	this.manageData(["message"], [message], []);
    }
    else { //Correct response, create the result List
        var suggestionlist = xml.getElementsByTagName("Items")[0].getElementsByTagName("Item");
        //Fill the table, 1 row per item
        for(var i=0; i < suggestionlist.length;i++){
            var item = suggestionlist[i];
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
            suggestionList.data.productList.push(row);
        }
        this.manageData(["suggestionList"], [suggestionList], []);
    }
},

onError: function (transport){}
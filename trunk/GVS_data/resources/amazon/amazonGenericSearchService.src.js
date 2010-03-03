search: function (filter){
   
    var pageNumber = (filter.data.pageNumber)? filter.data.pageNumber : 1;
    var productType = (filter.data.productType)? filter.data.productType : 'All';
    
    var parameters = {
			'SearchIndex': productType,
			'Keywords': filter.data.keywords,
			'ItemPage': pageNumber,
			'Operation': 'ItemSearch',
			'ResponseGroup': 'Medium',
			'Version': '2008-06-26'
	};
	
	var url = 'http://webservices.amazon.com/onca/xml?Service=AWSECommerceService&' + Object.toQueryString(parameters);
    
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
	var l = {id: 'list', data: new Array()};
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
                var title = "";
            }
            if (item.getElementsByTagName("FormattedPrice").length > 0) {
                var price = item.getElementsByTagName("FormattedPrice")[0].firstChild.nodeValue;
            } else {
                var price = "";
            }
            if (item.getElementsByTagName("ProductGroup").length > 0) {
                var pGroup = item.getElementsByTagName("ProductGroup")[0].firstChild.nodeValue;
            } else {
                var pGroup = "";
            }
            if (item.getElementsByTagName("DetailPageURL").length > 0) {
                var url = item.getElementsByTagName("DetailPageURL")[0].firstChild.nodeValue;
            } else {
                var url = "";
            }
            if (item.getElementsByTagName("SmallImage").length > 0) {
                var image = item.getElementsByTagName("SmallImage")[0].getElementsByTagName("URL")[0].firstChild.nodeValue;
            }else {
                var image = "";
            }
            if (item.getElementsByTagName("ASIN").length > 0) {
                var ASIN = item.getElementsByTagName("ASIN")[0].firstChild.nodeValue;
            }

            var row = {
                source: "Amazon",
                title: title,
                price: price,
                type: pGroup,
                id: ASIN,
                url: url,
                image: image
            };
            l.data.push(row);
        });
        
        this.manageData(["itemList"], [l], []);
    }
},

onError: function (transport){}
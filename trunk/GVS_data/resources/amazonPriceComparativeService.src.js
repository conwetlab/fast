fetch: function (item){
	//Get the facts to invoke the service
    //Add the ItemSearch parameters
    var parameters = "";
	parameters += "&ItemId=" + item.data.ASIN;
	parameters += "&MerchantId=All&Condition=All";
    
	//Base URL of the REST Service
	var url = "http://webservices.amazon.com/onca/xml?Service=AWSECommerceService";
	//Add the operation Type
	var url +="&Operation=ItemLookup";
	//Add the parameters
	url += parameters;
	//Add the responseGroup
	url +="&ResponseGroup=OfferFull";
	//Add the current version of the API
	url += "&Version=2008-06-26";
	
	var encoder = new URLAmazonEncoder();
	url = encoder.encode(url);

	//Invoke the service
    new FastAPI.Request(url,{
        'method':       'get',
        'content':      'xml',
        'context':      this.context,
        'onSuccess':    this.addToList.bind(this)
    });
},

addToList: function (transport){
	var l = {id: 'list', data:{productList: new Array(), currentPage: 0}};
    var xml = transport;
    //Check if the service returned an error
    if (xml.getElementsByTagName("IsValid")[0].childNodes[0].nodeValue == "False") {
    	var message = {name: "message", data:{message: xml.getElementsByTagName("Message")[0].childNodes[0].nodeValue}};
    	this.manageData(["message"], [message], []);
    } else { //Correct response, create the result List
        var comparativelist = xml.getElementsByTagName("Offers")[0].getElementsByTagName("Offer");
        //Fill the table, 1 row per item
        for(var i=0; i < comparativelist.length; i++){
            var offer = comparativelist[i];
            if (offer.getElementsByTagName("Name").length > 0) { 
                var sellerName = offer.getElementsByTagName("Name")[0].firstChild.nodeValue;
            } else {
				if (offer.getElementsByTagName("Nickname").length > 0) {
			    	var sellerName = offer.getElementsByTagName("Nickname")[0].firstChild.nodeValue;
				} else {
					var sellerName = "&nbsp;";
				}
            }
            if (offer.getElementsByTagName("SellerId").length > 0) {
                var sellerId = offer.getElementsByTagName("SellerId")[0].firstChild.nodeValue;
            } else {
			    var sellerId = "none";
            }
            if (offer.getElementsByTagName("AverageFeedbackRating").length > 0) { 
                var averageRating = offer.getElementsByTagName("AverageFeedbackRating")[0].firstChild.nodeValue;
            } else {
			    var averageRating = "&nbsp;";
            }
            if (offer.getElementsByTagName("TotalFeedback").length > 0) { 
                var totalFeedback = offer.getElementsByTagName("TotalFeedback")[0].firstChild.nodeValue;
            } else {
			    var totalFeedback = "&nbsp;";
            }
            if (offer.getElementsByTagName("Condition").length > 0) {
				var condition = offer.getElementsByTagName("Condition")[0].firstChild.nodeValue;             
            } else {
			    var condition = "&nbsp;";
            }
            if (offer.getElementsByTagName("ConditionNote").length > 0) {
				var conditionNote = "(" + offer.getElementsByTagName("ConditionNote")[0].firstChild.nodeValue + ")";             
            } else {
			    var conditionNote = "&nbsp;";
            }
            if (offer.getElementsByTagName("OfferListingId").length > 0) {
				var offerId = offer.getElementsByTagName("OfferListingId")[0].firstChild.nodeValue;             
            } else {
			    var offerId = "";
            }
            if (offer.getElementsByTagName("Price").length > 0) {
				var price = offer.getElementsByTagName("Price")[0].getElementsByTagName("FormattedPrice")[0].firstChild.nodeValue;             
            } else {
			    var price = "";
            }
            if (offer.getElementsByTagName("AmountSaved").length > 0) {
				var amountSaved = offer.getElementsByTagName("AmountSaved")[0].getElementsByTagName("FormattedPrice")[0].firstChild.nodeValue;             
            } else {
			    var amountSaved = "";
            }
            if (offer.getElementsByTagName("PercentageSaved").length > 0) {
				var percentageSaved = offer.getElementsByTagName("PercentageSaved")[0].firstChild.nodeValue;             
            } else {
			    var percentageSaved = "&nbsp;";
            }
            if (offer.getElementsByTagName("Availability").length > 0) {
				var availability = offer.getElementsByTagName("Availability")[0].firstChild.nodeValue;
            } else {
			    var availability = "&nbsp;";
            }
            var row = {
                sellerName: sellerName,
                sellerId: sellerId,
                location: location,
                averageRating: averageRating,
				totalFeedback: totalFeedback,
				condition: condition,
				conditionNote: conditionNote,
				offerId: offerId,
				price: price,
				amountSaved: amountSaved,
				percentageSaved: percentageSaved,
				availability: availability
            };
            l.data.productList.push(row);
	    }
        this.manageData(["productList"], [l], []);
    }
},

onError: function (transport){}
fetch: function (cart){
    //Get the facts to invoke the service
    //TODO add error handling
    //Invoke the service CartGet to retrieve the product list
    var url = "http://webservices.amazon.com/onca/xml?Service=AWSECommerceService";
	//Add the operation Type
	url +="&Operation=CartGet";
	//Add the current version of the API
	url += "&Version=2008-06-26";
	//Add item ID
	url += "&CartId=" + cart.data.id;
	url += "&HMAC=" + cart.data.HMAC;
	
	var encoder = new URLAmazonEncoder();
	url = encoder.encode(url);
	
	//Create the call
    new FastAPI.Request(url,{
        'method':       'get',
        'content':      'xml',
        'context':      this.context,
        'onSuccess':    this.addToList.bind(this)
    });
},

addToList: function (transport){
	var l = {id: "list", data:{productList: new Array(), subTotal: 0, itemTotal: 0, purchaseURL: null}};
    var xml = transport;
    //Check if the service returned an error
    if (xml.getElementsByTagName("IsValid")[0].childNodes[0].nodeValue == "False") {
    	var message = {id: "message", data:{message: xml.getElementsByTagName("Message")[0].childNodes[0].nodeValue}};
    	this.manageData(null, [message], []);
    } else { //Correct response, create the result List
    	if (xml.getElementsByTagName("CartItems").length > 0) { //There are products in the cart
			var list = xml.getElementsByTagName("CartItems")[0].getElementsByTagName("CartItem");
			//Fill the table, 1 row per item
			$A(list).each(function(item){
				if (item.getElementsByTagName("Title").length > 0) {
					var title = item.getElementsByTagName("Title")[0].firstChild.nodeValue;
				}
				if (item.getElementsByTagName("ASIN").length > 0) {
					var ASIN = item.getElementsByTagName("ASIN")[0].firstChild.nodeValue;
				}
				if (item.getElementsByTagName("CartItemId").length > 0) {
					var ID = item.getElementsByTagName("CartItemId")[0].firstChild.nodeValue;
				}
				if (item.getElementsByTagName("Price").length > 0) {
					var price = item.getElementsByTagName("Price")[0].getElementsByTagName("FormattedPrice")[0].firstChild.nodeValue;
				}
				if (item.getElementsByTagName("Quantity").length > 0) {
					var quantity = item.getElementsByTagName("Quantity")[0].firstChild.nodeValue;
				}
				var row = {
					title: title,
					price: price,
					ASIN: ASIN,
					id: ID,
					quantity: quantity
				};
				l.data.itemTotal += parseInt (quantity);
				l.data.productList.push(row);
			});
		}
		if (xml.getElementsByTagName("SubTotal").length>0) {
			l.data.subTotal = xml.getElementsByTagName("SubTotal")[0].getElementsByTagName("FormattedPrice")[0].firstChild.nodeValue;
		} else {
			l.data.subTotal = "$0.0";
		}
		if (xml.getElementsByTagName("PurchaseURL").length>0) {
			l.data.purchaseURL = xml.getElementsByTagName("PurchaseURL")[0].firstChild.nodeValue;
		}
		this.manageData(["list"], [l], []);
    }
},

onError: function (transport){}
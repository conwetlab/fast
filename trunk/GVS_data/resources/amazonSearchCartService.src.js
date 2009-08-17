/**{
	uri:"http://TODO/service#AmazonSearchCartService",
	id:"AmazonSearchCartService1",
	actions: [{action:"fetch", preconditions:[{id:"cart", name:"http://TODO/amazon#shoppingCart", positive:true}], uses:[{id:"user", name:"http://TODO/amazon#shoppingCart"}]}],
	postconditions: [{id:"cartList", name:"http://TODO/amazon#cartList", positive:false},
	                 {id:"message", name:"http://TODO/amazon#message", positive:false}],
	triggers:[]
}**/
{{element.name}}.prototype.fetch = function (cart, user){
    //Get the facts to invoke the service
    //TODO add error handling
    //Invoke the service CartGet to retrieve the product list
    var url = "http://webservices.amazon.com/onca/xml?Service=AWSECommerceService";
	//Add the AccessKeyId (get from the user fact)
	if (user) {
		url += "&AWSAccessKeyId=" + user.data.KeyId;
	} else {// if the KB doesn't contain a user key Id, add one by default
		url += "&AWSAccessKeyId=15TNKDQJGH6BD0Z4KY02";
	}
	//Add the operation Type
	url +="&Operation=CartGet";
	//Add the current version of the API
	url += "&Version=2008-06-26";
	//Add item ID
	url += "&CartId=" + cart.data.id;
	url += "&HMAC=" + cart.data.HMAC;
	
	//Create the call
    new FastAPI.Request(url,{
        'method':       'get',
        'content':      'xml',
        'context':      this,
        'onSuccess':    {{element.instance}}.addToList
    });
}

{{element.name}}.prototype.addToList = function (transport){
	var l = {id: "list", data:{productList: new Array(), subTotal: 0, itemTotal: 0, purchaseURL: null}};
    var xml = transport;
    //Check if the service returned an error
    if (xml.getElementsByTagName("IsValid")[0].childNodes[0].nodeValue == "False") {
    	var message = {id: "message", data:{message: xml.getElementsByTagName("Message")[0].childNodes[0].nodeValue}};
    	{{element.instance}}.manageData(null, [message], []);
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
		{{element.instance}}.manageData(["list"], [l], []);
    }
}

{{element.name}}.prototype.onError = function (transport){}
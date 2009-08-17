/**{
	uri:"http://TODO/service#AmazonAddOfferToCartService",
	id:"AmazonAddOfferToCartService1",
	actions: [{action:"add", preconditions:[{id:"item", name:"http://TODO/amazon#item", positive:true}]: uses:[{id:"user", name:"http://TODO/amazon#user"}, {id:"cart", name:"http://TODO/amazon#shoppingCart"}]}],
	postconditions: [{id:"cart", name:"http://TODO/amazon#shoppingCart", positive:true},
	                 {id:"message", name:"http://TODO/amazon#message", positive:true}],
	triggers:["message"]
}**/			
{{element.name}}.prototype.addToCart = function (offer, cart, user){
	if (cart) {//If the cart is already created, it will have an ID in the User Fact
		var url = "http://webservices.amazon.com/onca/xml?Service=AWSECommerceService";
		//Add the AccessKeyId (get from the user fact)
		if (user) {
			url += "&AWSAccessKeyId=" + user.data.KeyId;
		} else { // if the KB doesn't contain a user key Id, add one by default
			url += "&AWSAccessKeyId=15TNKDQJGH6BD0Z4KY02";
		}
		//Add the operation Type
		url +="&Operation=CartAdd";
		//Add the current version of the API
		url += "&Version=2008-06-26";
		//Add item ID
		url += "&CartId=" + cart.data.id;
		url += "&HMAC=" + cart.data.HMAC;
		url += "&Item.1.OfferListingId=" + offer.data.offerId;
		url += "&Item.1.Quantity=" + 1;
		
		//Invoke the service
    	FastAPI.getXML(url, this, {{element.instance}}.productAdded);
	} else { //Cart doesn't exist: Create a new cart with the product
		var url = "http://webservices.amazon.com/onca/xml?Service=AWSECommerceService";
		//Add the AccessKeyId (get from the user fact)
		if (user) {
			url += "&AWSAccessKeyId=" + user.data.KeyId;
		} else {// if the KB doesn't contain a user key Id, add one by default
			url += "&AWSAccessKeyId=15TNKDQJGH6BD0Z4KY02";
		}
		//Add the operation Type
		url +="&Operation=CartCreate";
		//Add the current version of the API
		url += "&Version=2008-06-26";
		//Add item ID
		url += "&Item.1.OfferListingId=" + offer.data.offerId;
		url += "&Item.1.Quantity=" + 1;
		
		//Invoke the service
    	new FastAPI.Request(url,{
            'method':       'get',
            'content':      'xml',
            'context':      this,
            'onSuccess':    {{element.instance}}.cartCreated
        });
	}
}

{{element.name}}.prototype.cartCreated = function (transport){
	var xml = transport;
	//The product is added to the cart,
	//tell it to the user
	if (xml.getElementsByTagName("IsValid")[0].firstChild.nodeValue == "True") {
		//Check if the product is eligible for shopping
		if ((xml.getElementsByTagName("Error").length > 0) && 
			xml.getElementsByTagName("Error")[0].firstChild.firstChild.nodeValue == "AWS.ECommerceService.ItemNotEligibleForCart"){
			//The product is not elegible
			var message = {id: "message", data:{message: "The product is not eligible to be added to the cart"}};
			{{element.instance}}.manageData(["message"], [message], []);
			return;
		}
		//Add the Cart ID to the KB
		var message = {id: "message", data:{message: "Product added to the shopping Cart"}};
		var cart = {id: 'cart',
					data:{id: xml.getElementsByTagName("CartId")[0].firstChild.nodeValue,
					HMAC: xml.getElementsByTagName("URLEncodedHMAC")[0].firstChild.nodeValue}};
		{{element.instance}}.manageData(["message"], [cart, message], []);
	} else {
		var message = {name: "message", data:{message: "Error adding the product to the cart"}};
		{{element.instance}}.manageData(["message"], [message], []);
    }
}

{{element.name}}.prototype.productAdded = function (transport){
	var xml = transport;
	var message = {name: "message", data:{message: ""}};
	
	//Check if the product is eligible for shopping
	if ((xml.getElementsByTagName("Error").length > 0) && 
		xml.getElementsByTagName("Error")[0].firstChild.firstChild.nodeValue == "AWS.ECommerceService.ItemNotEligibleForCart"){
		//The product is not elegible
		message.message = "The product is not eligible to be added to the cart";
		return;
	} else {
		//If the product is added to the cart,
		//tell it to the user
		if (xml.getElementsByTagName("IsValid")[0].firstChild.nodeValue == "True") {
			message.data.message = "Product added to the shopping Cart";
		} else {
			message.data.message = "Error adding the product to the cart";
		}
	}
	{{element.instance}}.manageData(["message"], [message], []);
}

{{element.name}}.prototype.onError = function (transport){}
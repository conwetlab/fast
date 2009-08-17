/**{
	uri:"http://TODO/service#AmazonAddItemToCartService",
	id:"AmazonAddItemToCartService1",
	actions: [{action:"add", preconditions:[{id:"item", name:"http://TODO/amazon#item", positive:true}]: uses:[{id:"user", name:"http://TODO/amazon#user"}, {id:"cart", name:"http://TODO/amazon#shoppingCart"}]}],
	postconditions: [{id:"cart", name:"http://TODO/amazon#shoppingCart", positive:true},
	                 {id:"message", name:"http://TODO/amazon#message", positive:true}],
	triggers:["message"]
}**/
{{element.name}}.prototype.add = function (item, cart, user){
	if (cart) {//If the cart is already created, it will have an ID in the User Fact
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
		
		//Invoke the service
    	new FastAPI.Request(url,{
            'method':       'get',
            'content':      'xml',
            'context':      this,
            'onSuccess':    function(transport){{{element.instance}}.isProductOnCart(transport, item, cart, user);}.bind(product)
        });
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
		url += "&Item.1.ASIN=" + item.data.ASIN;
		url += "&Item.1.Quantity=" + $F("quantitySelect");
		
		//Invoke the service
    	new FastAPI.Request(url,{
            'method':       'get',
            'content':      'xml',
            'context':      this,
            'onSuccess':    function(transport){{{element.instance}}.cartCreated(transport, item);}.bind(product)
        });
	}
}

{{element.name}}.prototype.cartCreated = function (transport, item){
	var xml = transport;

	var message = {id: 'message', data:{message: ""}};
	
	//The product is added to the cart,
	//tell it to the user	
	if (xml.getElementsByTagName("IsValid")[0].firstChild.nodeValue == "True") {
		//Check if the product is eligible for shopping
		if ((xml.getElementsByTagName("Error").length > 0) && 
			xml.getElementsByTagName("Error")[0].firstChild.firstChild.nodeValue == "AWS.ECommerceService.ItemNotEligibleForCart") {
			//The product is not elegible
			message.data.message = "The product is not eligible to be added to the cartt";
			{{element.instance}}.manageData(["message"], [message], []);
			return;
		}
		//Add the Cart ID to the KB
		var cart = {id: 'cart',
					data:{id: xml.getElementsByTagName("CartId")[0].firstChild.nodeValue,
					HMAC: xml.getElementsByTagName("URLEncodedHMAC")[0].firstChild.nodeValue}};
		message.data.message = "Product added to the shopping Cart";
		{{element.instance}}.manageData(["message"], [cart, message], []);
	} else {
		message.data.message = "Error adding the product to the cart";
		{{element.instance}}.manageData(["message"], [message], []);
	}
}

{{element.name}}.prototype.isProductOnCart = function (transport, item, cart, user){
	var xml = transport;
	//products node
	if (xml.getElementsByTagName ("CartItems").length>0) { //There are products on the cart
			var products = xml.getElementsByTagName ("CartItems")[0];
			//Product list (ASINs) added to the cart
			var asins = $A(products.getElementsByTagName ("ASIN"));
			//Check if the product is already added to the cart
			var found = false;
			//product Node
			var _product; 
			asins.each (function(asin){
				if (asin.firstChild.nodeValue == item.ASIN) {
					found = true; //The product is in the list
					_product = asin.parentNode; //product = CartItem
				}
			});
	} else {//If there aren't elements, the product will not be on the list
		found = false;
	}
	if (found) { 
		//If the product is already added to the cart,
		//increase the number of items of that product (CartModify)			
		//Get the item quantity
		var prevQuantity = _product.getElementsByTagName("Quantity")[0].firstChild.nodeValue;
		//Add the new quantity to the previously stored
		var quantity = parseInt($F("quantitySelect")) + parseInt (prevQuantity);
		
		//Get the product Id within the cart
		var productId = _product.getElementsByTagName("CartItemId")[0].firstChild.nodeValue;	

		//Create the call
		var url = "http://webservices.amazon.com/onca/xml?Service=AWSECommerceService";
		//Add the AccessKeyId (get from the user fact)
		if (user) {
			url += "&AWSAccessKeyId=" + user.data.KeyId;
		} else {// if the KB doesn't contain a user key Id, add one by default
			url += "&AWSAccessKeyId=15TNKDQJGH6BD0Z4KY02";
		}
		//Add the operation Type
		url +="&Operation=CartModify";
		//Add the current version of the API
		url += "&Version=2008-06-26";
		//Add item ID
		url += "&CartId=" + cart.data.id;
		url += "&HMAC=" + cart.data.HMAC;
		url += "&Item.1.CartItemId=" + productId;
		url += "&Item.1.Quantity=" + quantity;
		
		//Invoke the service
    	new FastAPI.Request(url,{
            'method':       'get',
            'content':      'xml',
            'context':      this,
            'onSuccess':    {{element.instance}}.productAdded
        });
	} else {
        //Create the call
		var url = "http://webservices.amazon.com/onca/xml?Service=AWSECommerceService";
		//Add the AccessKeyId (get from the user fact)
		if (user) {
			url += "&AWSAccessKeyId=" + user.data.KeyId;
		} else {// if the KB doesn't contain a user key Id, add one by default
			url += "&AWSAccessKeyId=15TNKDQJGH6BD0Z4KY02";
		}
		//Add the operation Type
		url +="&Operation=CartAdd";
		//Add the current version of the API
		url += "&Version=2008-06-26";
		//Add item ID
		url += "&CartId=" + cart.data.id;
		url += "&HMAC=" + cart.data.HMAC;
		url += "&Item.1.ASIN=" + item.data.ASIN;
		url += "&Item.1.Quantity=" + $F("quantitySelect");
		
		//Invoke the service
    	new FastAPI.Request(url,{
            'method':       'get',
            'content':      'xml',
            'context':      this,
            'onSuccess':    {{element.instance}}.productAdded
        });
	}
}

{{element.name}}.prototype.productAdded = function (transport){
	var xml = transport;
	var message = {id: 'message', data:{message: ""}};
	//Check if the product is eligible for shopping
	if ((xml.getElementsByTagName("Error").length > 0) && 
		xml.getElementsByTagName("Error")[0].firstChild.firstChild.nodeValue == "AWS.ECommerceService.ItemNotEligibleForCart") {
		//The product is not elegible
		message.data.message = "The product is not eligible to be added to the cart";
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
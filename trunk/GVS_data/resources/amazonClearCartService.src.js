clearService: function (cart){
	//Ask the user to confirm the operation
	if (confirm("Are you sure you want to empty your Shopping Cart?")) {
		//Create the call
		var url = "http://webservices.amazon.com/onca/xml?Service=AWSECommerceService";
		//Add the AccessKeyId (get from the user fact)
		//Add the operation Type
		url +="&Operation=CartClear";
		//Add the current version of the API
		url += "&Version=2008-06-26";
		//Add item ID
		url += "&CartId=" + cart.data.id;
		url += "&HMAC=" + cart.data.HMAC;
		
		var encoder = new URLAmazonEncoder();
		url = encoder.encode(url);
		
		//Invoke the service 	
       	new FastAPI.Request(url,{
            'method':       'get',
            'content':      'xml',
            'context':      this.context,
            'onSuccess':    this.clear.bind(this)
        });
	}	
},

clear: function (){
	this.manageData(["cartCleared"], [],["purchase"]);	
},

onError: function (transport){}
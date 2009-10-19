updateService: function (cart, update){
	//Create the call
	var url = "http://webservices.amazon.com/onca/xml?Service=AWSECommerceService";
	//Add the operation Type
	url +="&Operation=CartModify";
	//Add the current version of the API
	url += "&Version=2008-06-26";
	//Add item ID
	url += "&CartId=" + cart.data.id;
	url += "&HMAC=" + cart.data.HMAC;
	//Build the parameter list
	for (var i=0; i < update.data.list.length; i++){
		url += "&Item." + (i+1) + ".CartItemId=" + update.data.list[i]["id"];
		url += "&Item." + (i+1) + ".Quantity=" + update.data.list[i]["quantity"];
	}
	
	var encoder = new URLAmazonEncoder();
	url = encoder.encode(url);
	
	//Create the call
   	new FastAPI.Request(url,{
        'method':       'get',
        'content':      'xml',
        'context':      this.context,
        'onSuccess':    this.update.bind(this)
    });
},

update: function (){
	this.manageData(["cartUpdated"], [],["purchase"]);
},

onError: function (transport){}
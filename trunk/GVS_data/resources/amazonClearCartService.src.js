/**{
	uri:"http://TODO/service#AmazonClearCartService",
	id:"AmazonClearCartService1",
	actions: [{action:"clearService", preconditions:[{id:"cart", name:"http://TODO/amazon#shoppingCart", positive:true}]}],
	postconditions: [{id:"purchase", name:"http://TODO/amazon#purchase", positive:false}],
	triggers:["clearedCart"]
}**/
{{element.name}}.prototype.clearService = function (cart, user){
	//Ask the user to confirm the operation
	if (confirm("Are you sure you want to empty your Shopping Cart?")) {
		//Create the call
		var url = "http://webservices.amazon.com/onca/xml?Service=AWSECommerceService";
		//Add the AccessKeyId (get from the user fact)
		if (user) {
			url += "&AWSAccessKeyId=" + user.data.KeyId;
		} else {// if the KB doesn't contain a user key Id, add one by default
			url += "&AWSAccessKeyId=15TNKDQJGH6BD0Z4KY02";
		}
		//Add the operation Type
		url +="&Operation=CartClear";
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
            'onSuccess':    {{element.instance}}.clear
        });
	}	
}

{{element.name}}.prototype.clear = function (){
	ScreenEngineFactory.getInstance("ShoppingCart").manageData(["cartCleared"], [],["purchase"], "AmazonClearCartService1");	
}

{{element.name}}.prototype.onError = function (transport){}
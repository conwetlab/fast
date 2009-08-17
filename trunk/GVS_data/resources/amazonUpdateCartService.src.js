/**{
	uri:"http://TODO/service#AmazonUpdateCartService",
	id:"AmazonUpdateCartService1",
	actions: [{action:"updateService", preconditions:[{id:"cart", name:"http://TODO/amazon#shoppingCart", positive:true},
	                                                  {id:"update", name:"http://TODO/amazon#cartUpdate", positive:true}],
	                                   uses:[id:"user", name:"http://TODO/amazon#user"]}],
	postconditions: [{id:"purchase", name:"http://TODO/amazon#purchase", positive:false}],
	triggers:["clearedCart"]
}**/
{{element.name}}.prototype.updateService = function (cart, update, user){
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
	//Build the parameter list
	for (var i=0; i < update.data.list.length; i++){
		url += "&Item." + (i+1) + ".CartItemId=" + update.data.list[i]["id"];
		url += "&Item." + (i+1) + ".Quantity=" + update.data.list[i]["quantity"];
	}
	//Create the call
   	new FastAPI.Request(url,{
        'method':       'get',
        'content':      'xml',
        'context':      this,
        'onSuccess':    {{element.instance}}.update
    });
}

{{element.name}}.prototype.update = function (){
	{{element.instance}}.manageData(["cartUpdated"], [],["purchase"]);
}

{{element.name}}.prototype.onError = function (transport){}
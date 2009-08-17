/**{
	uri:"http://TODO/service#AmazonItemLookupService",
	id:"AmazonItemLookupService1",
	actions: [{action:"searchProduct", preconditions:[{id:"item", name:"http://TODO/amazon#item", positive:true}], uses:[]}],
	postconditions: [{id:"product", name:"http://TODO/amazon#product", positive:true}],
	triggers:["newProduct"]
}**/	
{{element.name}}.prototype.searchProduct = function (item, user){
	//Base URL of the REST Service
	var url = "http://webservices.amazon.com/onca/xml?Service=AWSECommerceService";
	//Add the AccessKeyId (get from the user fact)
	if (user) {
		url += "&AWSAccessKeyId=" + user.data.KeyId;
	} else {// if the KB doesn't contain a user key Id, add one by default
		url += "&AWSAccessKeyId=15TNKDQJGH6BD0Z4KY02";
	}
	//Add the operation Type
	url +="&Operation=ItemLookup";
	//Add the responseGroup
	url +="&ResponseGroup=Medium";
	//Add the current version of the API
	url += "&Version=2008-06-26";
	//Add item ID
	url += "&ItemId=" + item.data.ASIN;
	//Invoke the service
	new FastAPI.Request(url,{
        'method':       'get',
        'content':      'xml',
        'context':      this,
        'onSuccess':    {{element.instance}}.fetchProductInfo
    });
}

{{element.name}}.prototype.fetchProductInfo = function (transport){
	var xml = transport;
	var item = xml.getElementsByTagName("Item")[0];
	if (item.getElementsByTagName("Title").length > 0) {
		var title = item.getElementsByTagName("Title")[0].firstChild.nodeValue;
	}
	if (item.getElementsByTagName("FormattedPrice").length > 0) {
        var price = item.getElementsByTagName("FormattedPrice")[0].firstChild.nodeValue;
	}
	if (item.getElementsByTagName("ProductGroup").length > 0) {
        var pGroup = item.getElementsByTagName("ProductGroup")[0].firstChild.nodeValue;
	}
    if (item.getElementsByTagName("DetailPageURL").length > 0) {
        var url = item.getElementsByTagName("DetailPageURL")[0].firstChild.nodeValue;
    }
    if (item.getElementsByTagName("MediumImage").length > 0) {
        var image = item.getElementsByTagName("MediumImage")[0].getElementsByTagName("URL")[0].firstChild.nodeValue;
    }
    var _product = {
		id: "product",
		data:{title: title,
			price: price,
			item: item,
			pGroup: pGroup,
			url: url,
			image: image}
	};

    {{element.instance}}.manageData(["newProduct"], [_product], []);	
}

{{element.name}}.prototype.onError = function (transport){}
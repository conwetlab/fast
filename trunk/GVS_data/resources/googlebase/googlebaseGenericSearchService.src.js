//See http://code.google.com/intl/es-ES/apis/base/docs/2.0/reference.html#OtherQueryParams

search: function (filter){
	var parameters = this.buildParameter(this.parameter, this.getDefaultParameters());
	var start_index = (filter.data.pageNumber)? filter.data.pageNumber : 1;
	parameters = this.buildParameter({'q': filter.data.keywords, 'start-index':  start_index}, parameters);
	parameters = this.buildParameter(this.getMandatoryParameters(), parameters);

    var url = 'http://www.google.com/base/feeds/snippets?' + parameters.toQueryString() ;

    new FastAPI.Request(url ,{
        'method':       'get',
        'content':      'json',
        'context':      this,
        'onSuccess':    this.createList.bind(this)
    });
},

createList: function (transport){
	var l = {id: 'list', data: new Array()};
	var items = transport['feed']['entry'];
	
	for (var i=0; i<items.length; i++){
		var entry = items[i];
		var item = {'source': 'Google Base'};
		if(entry['id'] != undefined) item['id'] = entry['id']['$t']; 
		if(entry['title']['$t'] != undefined) item['title'] = entry['title']['$t'];
		if(entry['g$product_type'] != undefined) item['type'] = entry['g$product_type']['$t']; 
		if(entry['g$image_link'] != undefined) item['image'] = entry['g$image_link']['$t']; 
		if(entry['link'][0]['href'] != undefined) item['url'] = entry['link'][0]['href']; 
		if(entry['g$price'][0] != undefined) item['price'] = entry['g$price'][0]['$t']; 
		l.data.push(item);
	}
    this.manageData(["itemList"], [l], []);
},

onError: function (transport){
},

buildParameter: function (parameter, defaultParameter){
	var hash = new Hash(defaultParameter);
	hash.update(parameter);
	return hash;
},

getMandatoryParameters: function (){
	return {
		'alt': 'json',
		'key': 'ABQIAAAAk3QWT6GNpsznFG2Za7JpZhT2yXp_ZAY8_ufC3CFXhHIE1NvwkxQinpXz-Yj-vsiP5LxT3b4-WEkrfQ'
	};
},

getDefaultParameters: function (){
	return {
		'max-results': 10,
		'start-index': 1
	};
}
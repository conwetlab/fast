//See http://code.google.com/intl/es-ES/apis/base/docs/2.0/reference.html#OtherQueryParams

search: function (filter){
	var parameters = this.buildParameter(this.parameter, this.getDefaultParameters());
	parameters = this.buildParameter(filter.data, parameters);
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
	var l = {id: 'list', data: {}};
	l.data.title = transport['feed']['title']['$t'];
	l.data.totalResults = transport['feed']['openSearch$totalResults'];
	l.data.startIndex = transport['feed']['openSearch$startIndex'];
	l.data.itemsPerPage = transport['feed']['openSearch$itemsPerPage'];
	l.data.productList = transport['feed']['entry'];
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
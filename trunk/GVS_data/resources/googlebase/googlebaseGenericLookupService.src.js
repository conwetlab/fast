//See http://code.google.com/intl/es-ES/apis/base/docs/2.0/reference.html#OtherQueryParams

search: function (item){
    	parameters = this.getMandatoryParameters();

        var url = item.data.id + '?' + Object.toQueryString(parameters) ;

        new FastAPI.Request(url ,{
            'method':       'get',
            'content':      'json',
            'context':      this,
            'onSuccess':    this.createItem.bind(this)
        });
    },

    createItem: function (transport){
    	var item = {id: 'item', data: {'source': 'Google Base', 'details':{}}};
    	var entry = transport['entry'];
    	if(entry['id'] != undefined) item.data['id'] = entry['id']['$t']; 
    	if(entry['title'] != undefined) item.data['title'] = entry['title']['$t'];
    	if(entry['g$product_type'] != undefined) item.data['type'] = entry['g$product_type']['$t']; 
    	if(entry['g$image_link'] != undefined) item.data['image'] = entry['g$image_link']['$t']; 
    	if(entry['link'] != undefined) item.data['url'] = entry['link'][0]['href']; 
    	if(entry['g$price'] != undefined) item.data['price'] = entry['g$price'][0]['$t'];
    	
    	if(entry['brand'] != undefined) item.data.details['brand'] = entry['brand']['$t'];
    	if(entry['published'] != undefined) item.data.details['datePublished'] = entry['published']['$t'];
    	if(entry['content'] != undefined) item.data.details['description'] = entry['content']['$t'];
    	if(entry['g$condition'] != undefined) item.data.details['condition'] = entry['g$condition']['$t'];
    	if(entry['item_language'] != undefined) item.data.details['language'] = entry['item_language'][0]['$t']; 
    	if(entry['g$shipping'] != undefined) item.data.details['shipping'] = entry['g$shipping'][0]['g$price']['$t'];
    	if(entry['g$artist'] != undefined) item.data.details['creator'] = entry['g$artist']['$t'];
    	if(entry['g$rating'] != undefined) item.data.details['rating'] = entry['g$rating']['$t'];
    	
        this.manageData(["itemList"], [item], []);
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
    }
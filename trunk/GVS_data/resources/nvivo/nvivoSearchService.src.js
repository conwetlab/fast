//See http://www.nvivo.es/api

search: function (filter){

    	var parameters = {}
    	if(filter.data.user != undefined){
    		parameters['user'] = filter.data.user;
    		parameters['method'] = 'user.getEvents';
    	} else if(filter.data.venue_id != undefined){
    		parameters['venue_id'] = filter.data.venue_id;
    		parameters['method'] = 'venue.getEvents';
    	} else if(filter.data.city  != undefined){
    		parameters['city'] = filter.data.city;
    		parameters['method'] = 'city.getEvents';
    	}  else if(filter.data.artist != undefined){
    		parameters['artist'] = filter.data.artist;
    		parameters['method'] = 'artist.getEvents';
    	} else {
    		var l = {id: 'list', data: {}};
    		this.manageData(["eventList"], [l], []);
    	}
    	
    	parameters = this.buildParameter(this.getMandatoryParameters(), parameters);

        var url = 'http://www.nvivo.es/api/request.php?' + parameters.toQueryString() ;

        new FastAPI.Request(url ,{
            'method':       'get',
            'content':      'json',
            'context':      this,
            'onSuccess':    this.createList.bind(this)
        });
    },

    createList: function (transport){
    	var l = {id: 'list', data: {}};
    	l.data.eventList = transport['response']['gigs'];
        this.manageData(["eventList"], [l], []);
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
    		'format': 'json',
    		'api_key': 'f532a9d3d719ac58eda72ed750c8a0f4'
    	};
    }
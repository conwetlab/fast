/**
 * Search action
 */
search: function(searchCriteria) {
    var serviceURL = "http://search.twitter.com/search.json";

    var resultsPerPage = searchCriteria.data.resultsPerPage ?
                            searchCriteria.data.resultsPerPage : 15;
    var pageNumber = searchCriteria.data.pageNumber ?
                        searchCriteria.data.pageNumber : 1;

    var parameters = new Hash({
        "q" : searchCriteria.data.keywords, // query keywords
        "rpp" : resultsPerPage, // twits per page
        "page" : pageNumber // page from results
    });
    var url = serviceURL + "?" + parameters.toQueryString();
    new FastAPI.Request(url , {
        'method':       'get',
        'content':      'json',
        'context':      this,
        'onSuccess':    this._createList.bind(this)
    });
},

/**
 * Create the twit list
 */
_createList: function(responseJSON) {
    var twitList = [];
    for (var i = 0; i < responseJSON.results.length; i++) {
        var twit = responseJSON.results[i];
        twitList.push(twit);
    };

    var list = {
        "id": "list",
        "data": twitList
    };
    this.manageData([], [list], []);
}

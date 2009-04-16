var _fastAPI_igoogle = Class.create(_fastAPI,{
    
    initialize: function() {
    },
    
    getXML: function (url, context, handler) {
        _IG_FetchXmlContent(this._getUniqueUrl(url), handler, { refreshInterval: 0 }); 
    },
    
    getText: function (url, context, handler) {
        _IG_FetchContent(this._getUniqueUrl(url), handler, { refreshInterval: 0 });
    },
    
    _getUniqueUrl: function (url) {
        var timestamp = new Date().getTime();
        var ts = Math.floor( timestamp / 1000);
        var sep = "?";
        if (url.indexOf("?") > -1) {
            sep = "&";
        }
        return ([ url, sep, "nocache=", ts ].join(""));
    }
});

var FastAPI = new _fastAPI_igoogle();

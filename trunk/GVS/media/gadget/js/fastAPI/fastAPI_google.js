var FastAPI = {};

/**
 * Implementation of FastBaseAPI.IO for Google.
 * @constructs
 * @extends FastBaseAPI.IO
 */
FastAPI.IO = Class.create(FastBaseAPI.IO,{
    initialize: function($super) {
        $super();
    },

    createInVariable: function (variable, handler) {
        throw 'Method not supported.'  +
            'FastAPI.IO :: createInVariable';
    },

    createOutVariable: function (variable) {
        throw 'Method not supported.'  +
            'FastAPI.IO :: createOutVariable';
    }
});

/**
 * Implementation of FastBaseAPI.Request for Google.
 * @constructs
 * @extends FastBaseAPI.Request
 */
FastAPI.Request = Class.create(FastBaseAPI.Request,{
    initialize: function($super, url, options) {
        $super(url, options);
    },

    request: function() {
        var params = this.options;

        var _onSuccess = params.onSuccess;

        var method = params.method.toLowerCase();

        var reqParams = {};
        switch(method){
            case 'get':
                reqParams[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
                break;
            case 'post':
                reqParams[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
                break;
            case 'put':
                reqParams[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.PUT;
                break;
            case 'delete':
                reqParams[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.DELETE;
                break;
            default:
                reqParams[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
                break;
        }

        switch(params.content){
            case 'xml':
                reqParams[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
                break;
            case 'text':
                reqParams[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.TEXT;
                break;
            case 'json':
                reqParams[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
                break;
            default:
                reqParams[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.TEXT;
                break;
        }

        if (params.requestHeaders){
            reqParams[gadgets.io.RequestParameters.HEADERS] = params.requestHeaders;
        }

        if(method=='post' || method=='put'){
            var postdata = null;
            if(params.parameters){
                if(Object.isString(params.parameters)){
                    postdata = params.parameters;
                } else {
                    postdata = gadgets.io.encodeValues(params.parameters);
                }
            }
            if(params.postBody){
                postdata = params.postBody ;
            }
            reqParams[gadgets.io.RequestParameters.POST_DATA]= postdata;
        } else if (method=='get' || method=='delete'){
        if(params.parameters){
                if(!Object.isString(params.parameters)){
                    params.parameters = gadgets.io.encodeValues(params.parameters);
                }
                var sep = "?"
                if (this.url.indexOf("?") > -1) {
                    sep = "&";
                } else {
                    this.url += "?"
                }
                this.url = [this.url, params.parameters].join(sep);
            }
        }

        gadgets.io.makeRequest(this._getUniqueUrl(this.url), onSuccess, reqParams);

        function onSuccess(transport) {
            switch(params.content){
                case 'xml':
                    (_onSuccess || Prototype.emptyFunction)(transport.data);
                    break;
                case 'text':
                    (_onSuccess || Prototype.emptyFunction)(transport.text);
                    break;
                case 'json':
                    (_onSuccess || Prototype.emptyFunction)(transport.data);
                    break;
                default:
                    (_onSuccess || Prototype.emptyFunction)(transport);
                    break;
            }
        }
    },

    _getUniqueUrl: function (url) {
        /** var timestamp = new Date().getTime();
        var ts = Math.floor( timestamp / 1000);
        var sep = "?";
        if (url.indexOf("?") > -1) {
            sep = "&";
        }
        return ([ url, sep, "nocache=", ts ].join("")); **/
        return url;
    }
});

/**
 * Implementation of FastBaseAPI.Utils for Google.
 * @constructs
 * @extends FastBaseAPI.Utils
 */
FastAPI.Utils = Class.create(FastBaseAPI.Utils,{
    initialize: function($super) {
        $super();
    },

    toJSONString: function (obj) {
        return gadgets.json.stringify(obj);
    },

    toJSONObject: function (string) {
        return gadgets.json.parse(string);
    }
});

/**
 * Implementation of FastBaseAPI.Properties for Google.
 * @constructs
 * @extends FastBaseAPI.Properties
 */
FastAPI.Properties = Class.create(FastBaseAPI.Properties,{
    initialize: function($super) {
        $super();
        var variables = new Hash();
    },

    get: function (variable) {
        throw 'Method not supported.' +
        'FastAPI.Properties :: get';
    },

    set: function (variable, value) {
        throw 'Method not supported.' +
            'FastAPI.Properties :: set';
    }
});

/**
 * Implementation of FastBaseAPI.Persistence for Google.
 * @constructs
 * @extends FastBaseAPI.Persistence
 */
FastAPI.Persistence = Class.create(FastBaseAPI.Persistence,{
    initialize: function($super) {
        $super();
    },

    get: function (func) {
        var req = opensocial.newDataRequest();
        var fields = [FastAPI.Persistence.KB_VAR];

        req.add(req.newFetchPersonAppDataRequest(opensocial.IdSpec.PersonId.VIEWER, fields), 'viewer_data');
        req.add(req.newFetchPersonRequest(opensocial.DataRequest.PersonId.VIEWER), "viewer");
        req.send(function(data){
             var info = data.get('viewer_data').getData();
             var me = data.get('viewer').getData().getId();
             var kb = info[me][FastAPI.Persistence.KB_VAR];
             func(kb);
        }.bind(this));
    },

    set: function (value) {
        var req = opensocial.newDataRequest();
        req.add(req.newUpdatePersonAppDataRequest(opensocial.IdSpec.PersonId.VIEWER, FastAPI.Persistence.KB_VAR, value), 'set_data');
        req.send(this._callBack);
    },

    _callBack: function (value) {
        return value;
    }
});


FastAPI.Persistence.KB_VAR = '__knowledgebase';
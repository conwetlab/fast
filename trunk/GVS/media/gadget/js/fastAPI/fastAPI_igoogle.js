var FastAPI = {};

/**
 * Implementation of FastBaseAPI.IO for iGoogle.
 * @constructs
 * @extends FastBaseAPI.IO
 */
FastAPI.IO = Class.create(FastBaseAPI.IO,{
    initialize: function($super) {
        $super();
    },

    /**
     * Creates a Slot Variable for iGoogle.
     * @param variable
     *      represents the name of the variable
     * @param handler
     *      represents the handler for a variable when its value is set
     */
    createInVariable: function (variable, handler) {
        throw 'Method not supported.'  +
            'FastAPI.IO :: createInVariable';
    },

    /**
     * Creates an Event Variable for iGoogle.
     * @param variable
     *      represents the name of the variable
     */
    createOutVariable: function (variable) {
        throw 'Method not supported.'  +
            'FastAPI.IO :: createOutVariable';
    }
});

/**
 * Implementation of FastBaseAPI.Request for iGoogle.
 * @constructs
 * @extends FastBaseAPI.Request
 */
FastAPI.Request = Class.create(FastBaseAPI.Request,{
    /**
     * Initializes an object to make requests in iGoogle.
     * @param url
     *      url to be requested
     * @param options
     *      - method: 'get' || 'post' || 'put' || 'delete'
     *      - content: 'xml' || 'text' || 'json'
     *      - context: context of the invoking object
     *      - parameters: either as a URL-encoded string or as any Hash-compatible object.
     *      - requestHeaders: a javascript object with properties representing headers.
     *      - onSuccess: Invoked when a request completes and its status code is undefined or belongs in the 2xy family.
     *      - onFailure: Invoked when a request completes and its status code exists but is not in the 2xy family.
     */
    initialize: function($super, url, options) {
        $super(url, options);
    },

    /**
     * Make a general-purpose request to a remote server.
     */
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

        // This function handles a success in the asynchronous call
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
 * Implementation of FastBaseAPI.Utils for iGoogle.
 * @constructs
 * @extends FastBaseAPI.Utils
 */
FastAPI.Utils = Class.create(FastBaseAPI.Utils,{
    initialize: function($super) {
        $super();
    },

    /**
     * Returns a JSON string.
     * @param obj
     *      represents the name of the variable
     * @type JSON object
     */
    toJSONString: function (obj) {
        return gadgets.json.stringify(obj);
    },

    /**
     * Returns a JSON object.
     * @param string
     *      represents the name of the variable
     * @type string
     *
     */
    toJSONObject: function (string) {
        return gadgets.json.parse(string);
    }
});


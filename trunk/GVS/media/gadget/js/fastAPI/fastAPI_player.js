var FastAPI = {};

/**
 * Implementation of FastBaseAPI.IO for EzWeb.
 * @constructs
 * @extends FastBaseAPI.IO
 */
FastAPI.IO = Class.create(FastBaseAPI.IO,{
    initialize: function($super) {
        $super();
    },

    /**
     * Creates a Slot Variable.
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
     * Creates an Event Variable.
     * @param variable
     *      represents the name of the variable
     */
    createOutVariable: function (variable) {
        throw 'Method not supported.'  +
            'FastAPI.IO :: createOutVariable';
    }
});

/**
 * Implementation of FastBaseAPI.Request for Player.
 * @constructs
 * @extends FastBaseAPI.Request
 */
FastAPI.Request = Class.create(FastBaseAPI.Request,{
    /**
     * Initializes an object to make requests in Player.
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

        params.onSuccess = onSuccess;

        var newParams = {url:this.url, method: params["method"]};
        if (params["parameters"]){
            if (typeof(params["parameters"])=="string")
                var p = parameters;
            else
                var p = this.platform.Object.toJSON(params["parameters"]);
            newParams["params"] = p;
        }
        params["parameters"] = newParams;
        params["method"] = "POST";

        new Ajax.Request('/proxy', params);

        // This function handles a success in the asynchronous call
        function onSuccess(transport) {
            switch(params.content){
                case 'xml':
                    (_onSuccess || Prototype.emptyFunction)(transport.responseXML);
                    break;
                case 'text':
                    (_onSuccess || Prototype.emptyFunction)(transport.responseText);
                    break;
                case 'json':
                    var json = transport.responseJSON;
                    if (!json){
                        json = transport.responseText.evalJSON(true);
                    }
                    (_onSuccess || Prototype.emptyFunction)(json);
                    break;
                default:
                    (_onSuccess || Prototype.emptyFunction)(transport);
                    break;
            }
        }
    }
});

/**
 * Implementation of FastBaseAPI.Utils for Player.
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
     *      represents the object to convert
     * @type JSON object
     */
    toJSONString: function (obj) {
        return Object.toJSON(obj);
    },

    /**
     * Returns a JSON object.
     * @param string
     *      represents the string to convert
     * @type string
     *
     */
    toJSONObject: function (string) {
        return string.evalJSON(true);
    }
});

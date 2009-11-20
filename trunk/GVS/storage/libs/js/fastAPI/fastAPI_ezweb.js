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
     * Creates a Slot Variable for EzWeb.
     * @param variable
     *      represents the name of the variable
     * @param handler
     *      represents the handler for a variable when its value is set
     */
    createInVariable: function (variable, handler) {
        return EzWebAPI.createRGadgetVariable(variable, handler);
    },

    /**
     * Creates an Event Variable for EzWeb.
     * @param variable
     *      represents the name of the variable
     */
    createOutVariable: function (variable) {
        return EzWebAPI.createRWGadgetVariable(variable);
    }
});

/**
 * Implementation of FastBaseAPI.Request for EzWeb.
 * @constructs
 * @extends FastBaseAPI.Request
 */
FastAPI.Request = Class.create(FastBaseAPI.Request,{
    /**
     * Initializes an object to make requests in EzWeb.
     * @param url
     *      url to be requested
     * @param options
     *      - method: 'get' || 'post'
     *      - content: 'xml' || 'text'
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
        switch(params.method){
            //HTTP GET
            case 'get':
                EzWebAPI.send_get(this.url, params.context, onSuccess, onFailure, params.requestHeaders);
                break;
            //HTTP DELETE
            case 'delete':
                EzWebAPI.send_delete(this.url, params.context, onSuccess, onFailure, params.requestHeaders);
                break;
            //HTTP PUT
            case 'put':
                EzWebAPI.send_put(this.url, params.parameters, params.context, onSuccess, onFailure, params.requestHeaders);
                break;
            //HTTP POST
            case 'post':
            default:
                EzWebAPI.send_post(this.url, params.parameters, params.context, onSuccess, onFailure, params.requestHeaders);
                break;
        }

        // This function handles a success in the asynchronous call
        function onSuccess(transport) {
            switch(params.content){
                case 'xml':
                    (params.onSuccess || Prototype.emptyFunction)(transport.responseXML);
                    break;
                case 'text':
                    (params.onSuccess || Prototype.emptyFunction)(transport.responseText);
                    break;
                default:
                	(params.onSuccess || Prototype.emptyFunction)(transport);
                	break;
            }
        }

        // This function handles an error in the asynchronous call
        function onFailure(transport) {
            (params.onFailure || Prototype.emptyFunction)(transport);
        }
    }
});

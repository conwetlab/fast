/**
 * It represents the whols FastAPI
 * @namespace
 */
var FastAPI = {};
var FastBaseAPI = {};

FastBaseAPI.IO = Class.create(/** @lends FastAPI.IO.prototype */{
    /**
     * Creates an IO variable
     * @constructs
     * @param variable
     *      variable name to be created
     */
    initialize: function() {
    },

    /**
     * Creates a Slot Variable.
     * @param variable
     *      represents the name of the variable
     * @param handler
     *      represents the handler for a variable when its value is set
     */
    createInVariable: function (variable, handler) {
        throw 'Abstract Method invocation. ' +
              'FastAPI :: createInVariable';
    },

    /**
     * Creates an Event Variable for Google.
     * @param variable
     *      represents the name of the variable
     */
    createOutVariable: function (variable) {
        throw 'Abstract Method invocation. ' +
              'FastAPI :: createOutVariable';
    }
});

FastBaseAPI.Request = Class.create(/** @lends FastAPI.Request.prototype */{
    /**
     * Creates an object to make AJAX requests
     * @constructs
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
    initialize: function(url, options) {
        this.url = url;

        this.options = {
            method:         'post',
            asynchronous:   true,
            contentType:    'application/x-www-form-urlencoded',
            encoding:       'UTF-8',
            content:        '',
            onSuccess:      Prototype.emptyFunction,
            onFailure:      Prototype.emptyFunction
        };
        Object.extend(this.options, options || { });

        this.options.method = this.options.method.toLowerCase();

        if (Object.isString(this.options.parameters))
            this.options.parameters = this.options.parameters.toQueryParams();
        else if (Object.isHash(this.options.parameters))
            this.options.parameters = this.options.parameters.toObject();
        this.setRequestHeaders();
        this.request();
    },

    /**
     * Sets the default headers.
     * This method can be overriden and augmented by the implementations.
     *  - Accept defaults to 'text/javascript, text/html, application/xml, text/xml, *\/*'
     *  - Content-type is built based on the contentType and encoding options.
     * @private
     */
    setRequestHeaders: function() {
        var headers = {
            'Accept': 'text/javascript, text/html, application/xml, text/xml, application/json, */*'
        };

        if (this.options.method == 'post') {
            headers['Content-type'] = this.options.contentType +
                (this.options.encoding ? '; charset=' + this.options.encoding : '');
        }

        Object.extend(headers, this.options.requestHeaders || { });
        this.options.requestHeaders = headers;
    },

    /**
     * Make a general-purpose request to a remote server.
     * @private
     */
    request: function() {
        throw 'Abstract Method invocation. ' +
              'FastAPI.Request :: request';
    }
});


FastBaseAPI.Utils = Class.create(/** @lends FastAPI.Utils.prototype */{
    /**
     * Utils class
     * @constructs
     */
    initialize: function() {
    },

    /**
     * Returns a JSON string.
     * @param obj
     *      represents the name of the variable
     * @type Object
     */
    toJSONString: function (obj) {
        throw 'Abstract Method invocation. ' +
              'FastAPI.Utils :: toJSONString';
    },

    /**
     * Returns a JSON object.
     * @param string
     *      represents the name of the variable
     * @type String
     *
     */
    toJSONObject: function (string) {
        throw 'Abstract Method invocation. ' +
              'FastAPI.Utils :: toJSONObject';
    }
});

FastBaseAPI.Properties = Class.create(/** @lends FastAPI.Properties.prototype */{
    /**
     * This class is intended to access to context variables
     * of the mashup platform
     * @constructs
     */
    initialize: function() {
    },

    /**
     * Returns the context variable value.
     * @param obj
     *      represents the name of the variable
     * @type Object
     */
    get: function (variable) {
        throw 'Abstract Method invocation. ' +
              'FastAPI.Properties :: get';
    },

    /**
     * Sets the value of a context variable.
     * @param string
     *      represents the name of the variable
     * @param value
     *      represents value of the variable
     * @type String
     *
     */
    set: function (variable, value) {
        throw 'Abstract Method invocation. ' +
            'FastAPI.Properties :: set';
    }
});

FastBaseAPI.Properties.LOGIN = 'login';
FastBaseAPI.Properties.LANGUAGE = 'language';
FastBaseAPI.Properties.ORIENTATION = 'orientation';
FastBaseAPI.Properties.GADGET_HEIGHT = 'height';
FastBaseAPI.Properties.GADGET_WIDTH = 'width'
FastBaseAPI.Properties.GADGET_X_POSITION = 'xposition';
FastBaseAPI.Properties.GADGET_Y_POSITION = 'yposition';

FastBaseAPI.Persistence = Class.create(/** @lends FastAPI.Persistence.prototype */{
    /**
     * This class access to the persistent properties of the mashup platform
     * @constructs
     */
    initialize: function() {
    },

    /**
     * Returns the persistent data.
     * @param obj
     *      represents the name of the variable
     * @type Object
     */
    get: function (func) {
        throw 'Abstract Method invocation. ' +
              'FastAPI.Persistence :: get';
    },

    /**
     * Saves the data in persistent way.
     * @param value
     *      represents value of the variable
     * @type String
     *
     */
    set: function (value) {
        throw 'Abstract Method invocation. ' +
            'FastAPI.Persistence :: set';
    }
});

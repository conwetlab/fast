var FastBaseAPI = {};

FastBaseAPI.IO = Class.create({
    /**
     * Creates an IO variable
     * @param variable
     *      variable name to be created
     */
    initialize: function() {
    },

    createInVariable: function (variable, handler) {
        throw 'Abstract Method invocation. ' +
              'FastAPI :: createInVariable';
    },

    createOutVariable: function (variable) {
        throw 'Abstract Method invocation. ' +
              'FastAPI :: createOutVariable';
    }
});

FastBaseAPI.Request = Class.create({
    initialize: function(url, options) {
        this.url = url;

        /*
         * Firstly, only 2 callback methods will be considered:
         *  - onSuccess
         *  - onFailure
         */
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

    /*
     * sets the default headers, this method can be overriden and augmented by the implementations.
     *  - Accept defaults to 'text/javascript, text/html, application/xml, text/xml, *\/*'
     *  - Content-type is built based on the contentType and encoding options.
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

    request: function() {
        throw 'Abstract Method invocation. ' +
              'FastAPI.Request :: request';
    }
});


FastBaseAPI.Utils = Class.create({
    initialize: function() {
    },

    toJSONString: function (obj) {
        throw 'Abstract Method invocation. ' +
              'FastAPI.Utils :: toJSONString';
    },

    toJSONObject: function (string) {
        throw 'Abstract Method invocation. ' +
              'FastAPI.Utils :: toJSONObject';
    }
});

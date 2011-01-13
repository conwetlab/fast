/**
 * Prototype Improvements v0.2
 *
 * Various additions to the prototype.js
 */

/* Hack to JSON.stringify() */
(function(JSON) {
    var stringify = JSON.stringify;
    var toJSON = Array.prototype.toJSON;
    JSON.stringify = function stringifyProxy() {
        delete Array.prototype.toJSON;
        var result = stringify.apply(JSON, arguments);
        Array.prototype.toJSON = toJSON;
        return result;
    };
})(JSON);

Browser = {
    /**
     * Returns the user agent
     * @param {bool} useAlert
     */
     inspect: function(useAlert) {
        if (useAlert) {
             alert(navigator.userAgent);
        } else {
            return navigator.userAgent;
        }
    },

    /**
     * Returns true if browser is MS Internet Explorer
     */
    isMSIE: function() {
        return (navigator.userAgent.toLowerCase().indexOf("msie") > -1) && !this.isOpera();
    },

    /**
     * Returns true if browser is Opera
     */
    isOpera: function() {
        return navigator.userAgent.toLowerCase().indexOf("opera") > -1;
    },

    /**
     * Returns true if browzer is Mozilla
     */
    isMozilla: function() {
        return (navigator.userAgent.toLowerCase().indexOf("mozilla") > -1) && !this.isOpera() && !this.isMSIE();
    }
}

Object.genGUID = function() {
    var len = 8;

    if(!isNaN(parseInt(arguments[0]))) {
        len = parseInt(arguments[0]);
    }
    var chars = "abcdef0123456789";
    var output = "";
    while(output.length < len) {
        var rnd = Math.floor(Math.random() * (chars.length - 1));
        output += chars.charAt(rnd);
    }
    return output;
}

// Hack for right HTTP verbs
// Support for basic user auth
Ajax.Request.prototype.request = function(url) {
    this.url = url;
    this.method = this.options.method;
    var params = Object.clone(this.options.parameters);

    this.parameters = params;

    if (params = Hash.toQueryString(params)) {
        // when GET, append parameters to URL
        if (this.method == 'get') {
            this.url += (this.url.include('?') ? '&' : '?') + params;
        }
        else if (/Konqueror|Safari|KHTML/.test(navigator.userAgent)) {
            params += '&_=';
        }
    }

    try {
        if (this.options.onCreate) {
            this.options.onCreate(this.transport);
        }
        Ajax.Responders.dispatch('onCreate', this, this.transport);

        if (this.options.username && this.options.password) {
            this.transport.open(this.method.toUpperCase(), this.url,
                                this.options.asynchronous,
                                this.options.username,
                                this.options.password);
        } else {
            this.transport.open(this.method.toUpperCase(), this.url,
                                this.options.asynchronous);
        }

        if (this.options.asynchronous) {
            setTimeout(function() {
                this.respondToReadyState(1);
            }.bind(this), 10);
        }

        this.transport.onreadystatechange = this.onStateChange.bind(this);
        this.setRequestHeaders();

        this.body = ['put', 'post'].include(this.method) ?
                                    (this.options.postBody || params) : null;
        this.transport.send(this.body);

        /* Force Firefox to handle ready state 4 for synchronous requests */
        if (!this.options.asynchronous && this.transport.overrideMimeType) {
            this.onStateChange();
        }
    }
    catch (e) {
      this.dispatchException(e);
    }
}

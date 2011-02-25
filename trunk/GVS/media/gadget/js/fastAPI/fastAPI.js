/*...............................licence...........................................
 *
 *    (C) Copyright 2011 FAST Consortium
 *
 *     This file is part of FAST Platform.
 *
 *     FAST Platform is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     FAST Platform is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with FAST Platform.  If not, see <http://www.gnu.org/licenses/>.
 *
 *     Info about members and contributors of the FAST Consortium
 *     is available at
 *
 *     http://fast.morfeo-project.eu
 *
 *...............................licence...........................................*/
/**
 * It represents the whole FastAPI
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
     * <li>method: 'get' || 'post' || 'put' || 'delete'</li>
     * <li> content: 'xml' || 'text' || 'json'</li>
     * <li> context: context of the invoking object</li>
     * <li> parameters: either as a URL-encoded string or as any Hash-compatible object.</li>
     * <li> postBody: To be used instead of parameters, only for post/put. To be
     * used with raw data</li>
     * <li> requestHeaders: a javascript object with properties representing headers.</li>
     * <li> onSuccess: Invoked when a request completes and its status code is undefined or belongs in the 2xy family.</li>
     * <li> onFailure: Invoked when a request completes and its status code exists but is not in the 2xy family.</li>
     * <li> onXYZ: (with XYZ representing any HTTP status code): Invoked just after the response</li>
     *       is completed if the status code matchs the code used in the callback name. Prevents the execution of
     *       onSuccess and onFailure. Happens before onComplete.</li>
     * <li> onException: Fires when there was an exception while dispatching other callbacks.</li>
     */
    initialize: function(url, options) {
        this.url = url;

        this.options = {
            method:         'post',
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
        this.call();
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
    call: function() {
        throw 'Abstract Method invocation. ' +
              'FastAPI.Request :: request';
    }
});

/**
 * It represents the Utils namespace
 * @namespace
 */
FastAPI.Utils = {};

FastBaseAPI.Utils = {

    JSON: Class.create(/** @lends FastAPI.Utils.JSON.prototype */{
        /**
         * This class provides tools to deal with the JSON format
         * @constructs
         */
        initialize: function(){
        },
        /**
         * Returns a JSON string.
         * @param {Object} obj
         *      represents the name of the variable
         * @type String
         */
        toString: function (obj) {
            throw 'Abstract Method invocation. ' +
                  'FastAPI.Utils :: toString';
        },

        /**
         * Returns an Object.
         * @param {String} string
         *      represents the name of the variable
         * @type Object
         *
         */
        toObject: function (string) {
            throw 'Abstract Method invocation. ' +
                  'FastAPI.Utils :: toObject';
        }
    })

};

FastBaseAPI.Properties = Class.create(/** @lends FastAPI.Properties.prototype */{
    /**
     * This class is intended to access to context variables
     * of the mashup platform.
     * The properties that are available on request are:
     * <li>FastBaseAPI.Properties.LOGIN or 'login'</li>
     * <li>FastBaseAPI.Properties.LANGUAGE or 'language'</li>
     * <li>FastBaseAPI.Properties.ORIENTATION or 'orientation'</li>
     * <li>FastBaseAPI.Properties.GADGET_HEIGHT or 'height'</li>
     * <li>FastBaseAPI.Properties.GADGET_WIDTH or 'width'</li>
     * <li>FastBaseAPI.Properties.GADGET_X_POSITION or 'xposition'</li>
     * <li>FastBaseAPI.Properties.GADGET_Y_POSITION or 'yposition'</li>
     * <li>FastBaseAPI.Properties.PLATFORM or 'platform'</li>
     * @constructs
     */
    initialize: function() {
    },

    /**
     * Returns the context variable value.
     * @param {String} variable
     *      represents the name of the variable
     */
    get: function (variable) {
        throw 'Abstract Method invocation. ' +
              'FastAPI.Properties :: get';
    },

    /**
     * Sets the value of a context variable.
     * @param {String} variable
     *      represents the name of the variable
     * @param {String} value
     *      represents value of the variable
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
FastBaseAPI.Properties.PLATFORM = 'platform';

FastBaseAPI.Persistence = Class.create(/** @lends FastAPI.Persistence.prototype */{
    /**
     * This class access to the persistent properties of the mashup platform
     * @constructs
     */
    initialize: function() {
    },

    /**
     * Asynchronous method: gets the persistent data.
     * @param {function} func
     *      callback handler
     */
    get: function (func) {
        throw 'Abstract Method invocation. ' +
              'FastAPI.Persistence :: get';
    },

    /**
     * Asynchronous method: saves the data in persistent way.
     * @param {String} value
     *      represents value of the variable
     * @param {function} [func]
     *      callback handler
     */
    set: function (value, func) {
        throw 'Abstract Method invocation. ' +
            'FastAPI.Persistence :: set';
    }
});


/**
 * This set of methods are intended to access to the social data available in the platform
 * @namespace
 */
FastAPI.Social = {};
FastBaseAPI.Social = {

    Login: Class.create(/** @lends FastAPI.Social.Login.prototype */{
       /**
         * This class allows authenticating users
         * @constructs
         */
        initialize: function() {
        },

        /**
         * Authenticates the user.
         * @param {Options} credentials
         *      represents the credentials needed for the authentication
         */
        authenticate: function(credentials){
            throw 'Abstract Method invocation. ' +
            'FastAPI.Social.Login :: authenticate';
        }
    }),

    User: Class.create(/** @lends FastAPI.Social.User.prototype */{
        /**
         * This class allows managing the user's profile properties.
         * The properties that are available on request are:
         * <li>FastBaseAPI.Social.User.USER_NAME or 'USER_NAME'</li>
         * <li>FastBaseAPI.Social.User.FIRST_NAME or 'FIRST_NAME'</li>
         * <li>FastBaseAPI.Social.User.LAST_NAME or 'LAST_NAME'</li>
         * <li>FastBaseAPI.Social.User.DOB or 'DOB'</li>
         * <li>FastBaseAPI.Social.User.USER_EMAIL or 'EMAIL'</li>
         * <li>FastBaseAPI.Social.User.CURRENT_LOCATION or 'CURRENT_LOCATION'</li>
         * <li>FastBaseAPI.Social.User.STATUS or 'STATUS'</li>
         * <li>FastBaseAPI.Social.User.THUMBNAIL or 'THUMBNAIL'</li>
         * @constructs
         */
        initialize: function() {
        },

        /**
         * Returns the value of a specific user property.
         * @param {String} property
         *      represents the name of the property
         * @param {function} func
         *         callback handler
         */
        get: function(property, func){
            throw 'Abstract Method invocation. ' +
            'FastAPI.Social.User :: get';
        },

        /**
         * Sets the value of a user property.
         * @param {String} property
         *      represents the name of the property
         * @param {String} value
         *      represents value of the property
         *
         */
        set: function (property, value) {
            throw 'Abstract Method invocation. ' +
                'FastAPI.Social.User :: set';
        },

        /**
         * Sets the user's status.
         * @param status
         *      represents the status of the user
         */
        postStatus: function (status) {
            throw 'Abstract Method invocation. ' +
                'FastAPI.Social.User :: postStatus';
        },
    }),

    Friends: Class.create(/** @lends FastAPI.Social.Friends.prototype */{
        /**
         * This class offers the methods to deal with the user's friends
         * @constructs
         */
        initialize: function() {
        },

        /**
         * Creates an array with the user's friends and applies the handler passed as parameter to it.
         * The returned information about each friend contains:
         * <ul>
         * <li>id</li>
         * <li>FastBaseAPI.Social.User.USER_NAME or 'USER_NAME'</li>
         * <li>FastBaseAPI.Social.User.FIRST_NAME or 'FIRST_NAME'</li>
         * <li>FastBaseAPI.Social.User.LAST_NAME or 'LAST_NAME'</li>
         * <li>FastBaseAPI.Social.User.THUMBNAIL or 'THUMBNAIL'</li>
         *  </ul>
         * @param {function} func
         *      callback handler
         */

        getFriends: function (func) {
            throw 'Abstract Method invocation. ' +
            'FastAPI.Social.Friends :: getFriends';
        },

        /**
         * Not specified yed
         */
        tellAFriend: function () {
            throw 'Abstract Method invocation. ' +
            'FastAPI.Social.Friends :: tellAFriend';
        }

    })

};

FastBaseAPI.Social.User.USER_NAME = 'USER_NAME';
FastBaseAPI.Social.User.FIRST_NAME = 'FIRST_NAME';
FastBaseAPI.Social.User.LAST_NAME = 'LAST_NAME';
FastBaseAPI.Social.User.DOB = 'DOB';
FastBaseAPI.Social.User.USER_EMAIL = 'EMAIL';
FastBaseAPI.Social.User.CURRENT_LOCATION = 'CURRENT_LOCATION';
FastBaseAPI.Social.User.STATUS = 'STATUS';
FastBaseAPI.Social.User.THUMBNAIL = 'THUMBNAIL';

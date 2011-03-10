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

    createInVariable: function (variable, handler) {
        logger.log("Created in variable " + variable);
    },

    createOutVariable: function (variable) {
        logger.log("Created out variable " + variable);
    }
});

/**
 * Implementation of FastBaseAPI.Request for Player.
 * @constructs
 * @extends FastBaseAPI.Request
 */
FastAPI.Request = Class.create(FastBaseAPI.Request,{

    initialize: function($super, url, options) {
        $super(url, options);
    },

    call: function() {
        logger.log("AJAX call sent");
        var params = this.options;

        var _onSuccess = params.onSuccess;

        params.onSuccess = onSuccess;

        //Add url and processed parameters to adapt them to the proxy required data
        var newParams = {url:this.url, method: params["method"]};
        if (params["parameters"]){
            if (typeof(params["parameters"])=="string")
                var p = parameters;
            else{
                var jsonLib = new FastAPI.Utils.JSON();
                var p = jsonLib.toObject(params["parameters"]);
            }
            newParams["params"] = p;
        }
        params["parameters"] = newParams;
        params["method"] = "POST";

        new Ajax.Request('/proxy', params);

        // This function handles a success in the asynchronous call
        function onSuccess(transport) {
            logger.log("Data received from server");
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
                        var jsonLib = new FastAPI.Utils.JSON();
                        json = jsonLib.toObject(transport.responseText);
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

FastAPI.Utils = {

    /**
     * Implementation of FastBaseAPI.Utils.JSON for StandAlone gadgets.
     * @constructs
     * @extends FastBaseAPI.Utils.JSON
     */
    JSON: Class.create(FastBaseAPI.Utils.JSON,{
        initialize: function($super){
            $super();
        },

        toString: function (obj) {
            return Object.toJSON(obj);
        },

        toObject: function (string) {
            return string.evalJSON(true);
        }
    })
};

/**
 * Implementation of FastBaseAPI.Properties for Player.
 * @constructs
 * @extends FastBaseAPI.Properties
 */
FastAPI.Properties = Class.create(FastBaseAPI.Properties,{
    initialize: function($super) {
        $super();
        this._variables = new Hash();
    },

    get: function (variable) {
        return this._variables.get(variable);
    },

    set: function (variable, value) {
        this._variables.set(value,variable);
        logger.log("Variable " + variable + " has been set to " + value);
    }
});

/**
 * Implementation of FastBaseAPI.Persistence for Player.
 * @constructs
 * @extends FastBaseAPI.Persistence
 */
FastAPI.Persistence = Class.create(FastBaseAPI.Persistence,{
    initialize: function($super) {
        $super();
    },

    get: function (func) {
        logger.log("Persistence get called");
    },

    set: function (value, func) {
        logger.log("Perssistence set called");
    }
});

FastAPI.Social = {

    /**
     * Implementation of FastBaseAPI.Social.Login for StandAlone gadgets.
     * @constructs
     * @extends FastBaseAPI.Social.Login
     */
    Login: Class.create(FastBaseAPI.Social.Login,{

        initialize: function($super) {
            $super();
        },

        authenticate: function(credentials){
            logger.log("Social.Login authenticate called");
        }
    }),

    User: Class.create(FastBaseAPI.Social.User,{

        initialize: function($super) {
            $super();
        },

        get: function(property, func){
            logger.log("Social.User get called");


        },

        set: function (property, value) {
            logger.log("Social.User set called");
        },

        postStatus: function (status) {
            logger.log("Social.User postStatus called");
        },
    }),

    /**
     * Implementation of FastBaseAPI.Social.Friends for StandAlone gadgets.
     * @constructs
     * @extends FastBaseAPI.Social.Friends
     */
    Friends: Class.create(FastBaseAPI.Social.Friends,{

        initialize: function($super) {
            $super();
        },

        getFriends: function (func) {
            logger.log("Social.Friends getFriends called");
        },

        tellAFriend: function () {
            logger.log("Social.Friends tellAFriend called");
        }

    })

};

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
        Logger.log("Created in variable " + variable);
    },

    createOutVariable: function (variable) {
        Logger.log("Created out variable " + variable);
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
        Logger.log("AJAX call sent");
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
            Logger.log("Data received from server");
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
        Logger.log("Variable " + variable + " has been set to " + value);
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
        Logger.log("Persistence get called");
    },

    set: function (value, func) {
        Logger.log("Perssistence set called");
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
            Logger.log("Social.Login authenticate called");
        }
    }),

    User: Class.create(FastBaseAPI.Social.User,{

        initialize: function($super) {
            $super();
        },

        get: function(property, func){
            Logger.log("Social.User get called");


        },

        set: function (property, value) {
            Logger.log("Social.User set called");
        },

        postStatus: function (status) {
            Logger.log("Social.User postStatus called");
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
            Logger.log("Social.Friends getFriends called");
        },

        tellAFriend: function () {
            Logger.log("Social.Friends tellAFriend called");
        }

    })

};

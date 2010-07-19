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
        throw 'Method not supported.'  +
            'FastAPI.IO :: createInVariable';
    },

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

    initialize: function($super, url, options) {
        $super(url, options);
        if (_debugger) {
            _debugger.request(this.url, this.options);
        }
    },

    call: function() {
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
            var response;
            switch(params.content){
                case 'xml':
                    response = transport.responseXML;
                    break;
                case 'text':
                    response = transport.responseText;
                    break;
                case 'json':
                    var json = transport.responseJSON;
                    if (!json){
                        var jsonLib = new FastAPI.Utils.JSON();
                        json = jsonLib.toObject(transport.responseText);
                    }
                    response = json;
                    break;
                default:
                    response = transport;
                    break;
            }
            (_onSuccess || Prototype.emptyFunction)(response);
            if (_debugger) {
                _debugger.onRequestSuccess(response, params.content);
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
 * Implementation of FastBaseAPI.Persistence for Player.
 * @constructs
 * @extends FastBaseAPI.Persistence
 */
FastAPI.Persistence = Class.create(FastBaseAPI.Persistence,{
    initialize: function($super) {
        $super();
    },

    get: function (func) {
        throw 'Method not supported.' +
        'FastAPI.Persistence :: get';
    },

    set: function (value, func) {
        throw 'Method not supported.' +
            'FastAPI.Persistence :: set';
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
            throw 'Method not supported.' +
            'FastAPI.Social.Login :: authenticate';
        }
    }),

    User: Class.create(FastBaseAPI.Social.User,{

        initialize: function($super) {
            $super();
        },

        get: function(property, func){
            throw 'Method not supported.' +
            'FastAPI.Social.User :: get';

        },

        set: function (property, value) {
            throw 'Method not supported.' +
            'FastAPI.Social.User :: set';
        },

        postStatus: function (status) {
            throw 'Method not supported.' +
            'FastAPI.Social.User :: postStatus';
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
            throw 'Method not supported.' +
            'FastAPI.Social.Friends :: get';
        },

        tellAFriend: function () {
            throw 'Method not supported.' +
            'FastAPI.Social.Friends :: tellAFriend';
        }

    })

};

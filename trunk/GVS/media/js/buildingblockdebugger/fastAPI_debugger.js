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

    request: function() {
        Logger.log("AJAX call sent");
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

    toJSONString: function (obj) {
        return Object.toJSON(obj);
    },

    toJSONObject: function (string) {
        return string.evalJSON(true);
    }
});

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

    set: function (value) {
        Logger.log("Perssistence set called");
    }
});

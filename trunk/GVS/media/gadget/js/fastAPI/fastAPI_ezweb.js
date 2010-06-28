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
        return EzWebAPI.createRGadgetVariable(variable, handler);
    },

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

    initialize: function($super, url, options) {
        $super(url, options);
    },

    request: function() {
        var params = this.options;

        var _onSuccess = params.onSuccess;

        params.onSuccess = onSuccess;

        if (params.content == 'json'){
            params['evalJSON'] = true;
            params['sanitizeJSON'] = true;
        }

        EzWebAPI.send(this.url, params.context, params);

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
 * Implementation of FastBaseAPI.Utils for EzWeb.
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
 * Implementation of FastBaseAPI.Properties for EzWeb.
 * @constructs
 * @extends FastBaseAPI.Properties
 */
FastAPI.Properties = Class.create(FastBaseAPI.Properties,{
    initialize: function($super) {
        $super();
        var variables = new Hash();
    },

    get: function (variable) {
        return PropertiesSingleton.getInstance().get(variable);
    },

    set: function (variable, value) {
        throw 'Method not supported.' +
            'FastAPI.Properties :: set';
    }
});

var PropertiesSingleton = function() {
    var _instance = null;

    var Properties = Class.create( /** @lends PropertiesSingleton-Properties.prototype */ {
        initialize: function() {
            this.equivalences = {};
            this.equivalences[FastBaseAPI.Properties.LOGIN] = 'user_name';
            this.equivalences[FastBaseAPI.Properties.LANGUAGE] = 'language';
            this.equivalences[FastBaseAPI.Properties.ORIENTATION] = 'orientation';
            this.equivalences[FastBaseAPI.Properties.GADGET_HEIGHT] = 'heightInPixels';
            this.equivalences[FastBaseAPI.Properties.GADGET_WIDTH] = 'widthInPixels';
            this.equivalences[FastBaseAPI.Properties.GADGET_X_POSITION] = 'xPosition';
            this.equivalences[FastBaseAPI.Properties.GADGET_Y_POSITION] = 'yPosition';
            this.variables = new Hash();
        },

        get: function (variable) {
            if(!this.equivalences[variable]){
                throw 'Variable not supported.' +
                'FastAPI.Properties :: get';
            }
            var obj = this.variables.get(variable);
            if(!obj){
                obj = EzWebAPI.createRGadgetVariable(this.equivalences[variable], this._callBack);
                this.variables.set(variable, obj);
            }
            return obj.get();
        },

        _callBack: function (value) {
            return value;
        }
    });

    return new function() {
        this.getInstance = function() {
            if (_instance == null) {
                _instance = new Properties();
            }
            return _instance;
        }
    }
}();

/**
 * Implementation of FastBaseAPI.Persistence for EzWeb.
 * @constructs
 * @extends FastBaseAPI.Persistence
 */
FastAPI.Persistence = Class.create(FastBaseAPI.Persistence,{
    initialize: function($super) {
        $super();
    },

    get: function (func) {
        var value = PersistenceSingleton.getInstance().get(func);
        func(value);
    },

    set: function (value) {
        PersistenceSingleton.getInstance().set(value);
    }
});

var PersistenceSingleton = function() {
    var _instance = null;

    var Persistence = Class.create( /** @lends PersistenceSingleton-Persistence.prototype */ {
        initialize: function() {
            this.variable = EzWebAPI.createRWGadgetVariable(FastAPI.Persistence.KB_VAR);
        },

        get: function (callBack) {
            callBack(this.variable.get());
        },

        set: function (value) {
            this.variable.set(value);
        },
    });

    return new function() {
        this.getInstance = function() {
            if (_instance == null) {
                _instance = new Persistence();
            }
            return _instance;
        }
    }
}();

FastAPI.Persistence.KB_VAR = '__knowledgebase';

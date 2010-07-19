var FastAPI = {};

/**
 * Implementation of FastBaseAPI.IO for Google.
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
 * Implementation of FastBaseAPI.Request for Google.
 * @constructs
 * @extends FastBaseAPI.Request
 */
FastAPI.Request = Class.create(FastBaseAPI.Request,{
    initialize: function($super, url, options) {
        $super(url, options);
    },

    call: function() {
        var params = this.options;

        var regexp = "^asynchronous$|^contentType$|^encoding$|^function$|^onCreate$|" +
            + "^onUninitialized$|^onLoading$|^onLoaded$|^onInteractive$";
        var invalidOptionsRegExp = new RegExp(regexp);
        for (opt in params){
            if (opt.match(invalidOptionsRegExp))
                throw 'Option not supported in FastAPI.Request :: call. ' + opt;
        }

        var method = params.method.toLowerCase();

        var reqParams = {};
        switch(method){
            case 'get':
                reqParams[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
                break;
            case 'post':
                reqParams[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.POST;
                break;
            case 'put':
                reqParams[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.PUT;
                break;
            case 'delete':
                reqParams[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.DELETE;
                break;
            default:
                reqParams[gadgets.io.RequestParameters.METHOD] = gadgets.io.MethodType.GET;
                break;
        }

        switch(params.content){
            case 'xml':
                reqParams[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.DOM;
                break;
            case 'text':
                reqParams[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.TEXT;
                break;
            case 'json':
                reqParams[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.JSON;
                break;
            default:
                reqParams[gadgets.io.RequestParameters.CONTENT_TYPE] = gadgets.io.ContentType.TEXT;
                break;
        }

        if (params.requestHeaders){
            reqParams[gadgets.io.RequestParameters.HEADERS] = params.requestHeaders;
        }

        if(method=='post' || method=='put'){
            var postdata = null;
            if(params.parameters){
                if(Object.isString(params.parameters)){
                    postdata = params.parameters;
                } else {
                    postdata = gadgets.io.encodeValues(params.parameters);
                }
            }
            if(params.postBody){
                postdata = params.postBody ;
            }
            reqParams[gadgets.io.RequestParameters.POST_DATA]= postdata;
        } else if (method=='get' || method=='delete'){
        if(params.parameters){
                if(!Object.isString(params.parameters)){
                    params.parameters = gadgets.io.encodeValues(params.parameters);
                }
                var sep = "?"
                if (this.url.indexOf("?") > -1) {
                    sep = "&";
                } else {
                    this.url += "?"
                }
                this.url = [this.url, params.parameters].join(sep);
            }
        }

        gadgets.io.makeRequest(this._getUniqueUrl(this.url), callback, reqParams);

        function callback(transport) {
            var param = transport;

            //First of all, check if an onXYZ handler has been defined
            var func = eval('params.on'+transport.rc);

            if(!func){

                //Check if it is a success or an error
                if(String(transport.rc)[0] = '2'){
                    //success
                    switch(params.content){
                        case 'xml':
                        case 'json':
                           param = transport.data;
                            break;
                        case 'text':
                            param = transport.text;
                            break;
                        default:
                            break;
                    }

                    func = (params.onSuccess || Prototype.emptyFunction);
                }
                else{
                    //error
                    func = (params.onFailure || Prototype.emptyFunction);
                }

            }

            //binding to the context
            if(params.context){
                    func = func.bind(params.context);
            }
            //execute the handler
            try{
                func(param);
            }catch (e){
                //call the onException handler
                func = (params.onException || Prototype.emptyFunction);
                if(params.context){
                    func = func.bind(params.context);
                }
                func(param, e);
            }

            if(params.onComplete){
                func = params.onComplete;
                if(params.context){
                    func = func.bind(params.context);
                }
                func(param);
            }
        }
    },

    _getUniqueUrl: function (url) {
        /** var timestamp = new Date().getTime();
        var ts = Math.floor( timestamp / 1000);
        var sep = "?";
        if (url.indexOf("?") > -1) {
            sep = "&";
        }
        return ([ url, sep, "nocache=", ts ].join("")); **/
        return url;
    }
});

FastAPI.Utils = {

    /**
     * Implementation of FastBaseAPI.Utils.JSON for Google.
     * @constructs
     * @extends FastBaseAPI.Utils.JSON
     */
    JSON: Class.create(FastBaseAPI.Utils.JSON,{
        initialize: function($super){
            $super();
        },

        toString: function (obj) {
            return gadgets.json.stringify(obj);
        },

        toObject: function (string) {
            return gadgets.json.parse(string);
        }
    })
};

/**
 * Implementation of FastBaseAPI.Properties for Google.
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

            this.prefs = new gadgets.Prefs();

            this.equivalences = {};
            this.equivalences[FastBaseAPI.Properties.LANGUAGE] = 'this.prefs.getLang()';
            this.equivalences[FastBaseAPI.Properties.GADGET_HEIGHT] = 'gadgets.window.getViewportDimensions().height';
            this.equivalences[FastBaseAPI.Properties.GADGET_WIDTH] = 'gadgets.window.getViewportDimensions().width';

            this.variables = new Hash();
        },

        get: function (property) {
            if(!this.equivalences[property]){
                throw 'Property not supported.' +
                'FastAPI.Properties :: get';
            }
            var value = this.variables.get(property);
            if(!value){
                value = eval(this.equivalences[property]);
                this.variables.set(property, value);
            }
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
 * Implementation of FastBaseAPI.Persistence for Google.
 * @constructs
 * @extends FastBaseAPI.Persistence
 */
FastAPI.Persistence = Class.create(FastBaseAPI.Persistence,{
    initialize: function($super) {
        $super();
    },

    get: function (func) {
        var req = opensocial.newDataRequest();
        var fields = [FastAPI.Persistence.KB_VAR];

        //Using OpenSocial 0.8
        var p = {};
        p[opensocial.IdSpec.Field.USER_ID] = opensocial.IdSpec.PersonId.VIEWER;
        var idSpec = opensocial.newIdSpec(p);

        req.add(req.newFetchPersonAppDataRequest(idSpec, fields), 'viewer_data');
        req.add(req.newFetchPersonRequest(opensocial.IdSpec.PersonId.VIEWER), "viewer");

        req.send(function(data){
            var facts = null;
            if (!data.hadError()){
                var me = data.get('viewer').getData().getId();
                var info = data.get('viewer_data').getData();
                try{
                    var kb = info[me][FastAPI.Persistence.KB_VAR];
                    //unescape the data that Opensocial has escaped automatically
                    facts = gadgets.util.unescapeString(kb);
                }
                catch(e){
                    //no app data, so do nothing
                }
            }
            func(facts);
        }.bind(this));
    },

    set: function (value, func) {
        var req = opensocial.newDataRequest();
        req.add(req.newUpdatePersonAppDataRequest(opensocial.IdSpec.PersonId.VIEWER, FastAPI.Persistence.KB_VAR, value), 'set_data');
        if (!func){
            func = Prototype.emptyFunction;
        }
        req.send(func);
    }

});


FastAPI.Persistence.KB_VAR = '__knowledgebase';

/**
 * This set of methods are intended to access to the social data available in the platform
 * @namespace
 */
FastAPI.Social = {
    /**
     * Implementation of FastBaseAPI.Social.Login for Google.
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

    /**
     * Implementation of FastBaseAPI.Social.User for Google.
     * @constructs
     * @extends FastBaseAPI.Social.User
     */
    User: Class.create(FastBaseAPI.Social.User,{

        initialize: function($super) {
            $super();
        },

        get: function(property, func){

            UserPropertiesSingleton.getInstance().get(property, func);
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
     * Implementation of FastBaseAPI.Social.Friends for Google.
     * @constructs
     * @extends FastBaseAPI.Social.Friends
     */
    Friends: Class.create(FastBaseAPI.Social.Friends,{

        initialize: function($super) {
            $super();
        },

        getFriends: function (func) {

            var req = opensocial.newDataRequest();
            req.add(req.newFetchPersonRequest(opensocial.IdSpec.PersonId.VIEWER), 'viewer');

            var viewerFriends = opensocial.newIdSpec({ "userId" : "VIEWER", "groupId" : "FRIENDS" });
            var params = {};
            params[opensocial.DataRequest.PeopleRequestFields.MAX] = 100;
            req.add(req.newFetchPeopleRequest(viewerFriends, params), 'viewerFriends');

            req.send(function (data){
                var friends = [];
                if (!data.hadError()){
                    var viewerFriends = data.get('viewerFriends').getData();
                    viewerFriends.each(function(person){
                        if (person.getId()){
                            var friend = {};
                            friend["id"] = person.getId();
                            friend[FastBaseAPI.Social.User.USER_NAME] = person.getDisplayName();
                            friend[FastBaseAPI.Social.User.FIRST_NAME] = person.getField(opensocial.Person.Field.NAME).getField("givenName");
                            friend[FastBaseAPI.Social.User.LAST_NAME] = person.getField(opensocial.Person.Field.NAME).getField("familyName");
                            friend[FastBaseAPI.Social.User.THUMBNAIL] = person.getField(opensocial.Person.Field.THUMBNAIL_URL);
                            friends.push(friend);
                        }
                    });

                }
                func(friends)
            });
        },

        tellAFriend: function () {
            throw 'Method not supported.' +
            'FastAPI.Social.Friends :: tellAFriend';
        }

    })

};
var UserPropertiesSingleton = function() {
    var _instance = null;

    var Properties = Class.create( /** @lends UserPropertiesSingleton-Properties.prototype */ {
        initialize: function() {
            this.equivalences = {};
            this.equivalences[FastBaseAPI.Social.User.USER_NAME] = opensocial.Person.Field.NICKNAME;
            this.equivalences[FastBaseAPI.Social.User.FIRST_NAME] = opensocial.Person.Field.NAME;
            this.equivalences[FastBaseAPI.Social.User.LAST_NAME] = opensocial.Person.Field.NAME;
            this.equivalences[FastBaseAPI.Social.User.DOB] = opensocial.Person.Field.DATE_OF_BIRTH;
            this.equivalences[FastBaseAPI.Social.User.USER_EMAIL] = opensocial.Person.Field.EMAILS;
            this.equivalences[FastBaseAPI.Social.User.CURRENT_LOCATION] = opensocial.Person.Field.CURRENT_LOCATION;
            this.equivalences[FastBaseAPI.Social.User.STATUS] = opensocial.Person.Field.STATUS;
            this.equivalences[FastBaseAPI.Social.User.THUMBNAIL] = opensocial.Person.Field.THUMBNAIL_URL;
            this.properties = new Hash();
        },

        get: function (property, func) {

            var _callBack = function(data){
                var value  = null;
                var viewer = data.get("viewer_profile").getData();
                if (!data.hadError()){
                    switch (property){
                        case FastBaseAPI.Social.User.USER_NAME:
                            value = viewer.getDisplayName();
                            break;
                        case FastBaseAPI.Social.User.FIRST_NAME:
                            if (viewer.getField(opensocial.Person.Field.NAME))
                                value = viewer.getField(opensocial.Person.Field.NAME).getField("givenName");
                            break;
                        case FastBaseAPI.Social.User.LAST_NAME:
                            if (viewer.getField(opensocial.Person.Field.NAME))
                                value = viewer.getField(opensocial.Person.Field.NAME).getField("familyName");
                            break;
                        case FastBaseAPI.Social.User.CURRENT_LOCATION:
                            value = {};
                            var location = viewer.getField(opensocial.Person.Field.CURRENT_LOCATION);
                            if (location){
                                value["country"] = location.getField("country");
                                value["locality"] = location.getField("locality");
                                value["region"] = location.getField("region");
                                value["type"] = location.getField("type");
                            }
                            break;
                        default:
                            if(this.equivalences[property])
                                value = viewer.getField(this.equivalences[property]);
                            else
                                value = viewer.getField(property);
                    }

                    this.properties.set(property, value);
                    func(value);
                }else{
                    throw 'ERROR: ' + data.errorMessage_;
                }
            }.bind(this);


            var value = this.properties.get(property);
            if (value){
                func(value);
            }else{

                var req = opensocial.newDataRequest();

                var params = {};

                var field = [];
                if (this.equivalences[property])
                    params[opensocial.DataRequest.PeopleRequestFields.PROFILE_DETAILS] = [this.equivalences[property]];
                else{
                    //try in case the property is an openSocial property
                    params[opensocial.DataRequest.PeopleRequestFields.PROFILE_DETAILS] = [property];
                }

                req.add(req.newFetchPersonRequest("VIEWER", params), "viewer_profile");
                req.send(_callBack);

            }
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


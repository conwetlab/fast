var _fastAPI_ezweb = Class.create(_fastAPI,{

    initialize: function() {
    },

    createRGadgetVariable: function ( /** string */ variable, /** string */ method) {
        return EzWebAPI.createRGadgetVariable(variable, method);
    },

    createRWGadgetVariable: function ( /** string */ variable) {
        return EzWebAPI.createRWGadgetVariable(variable);
    },

    getXML: function (url, context, handler) {
        EzWebAPI.send_get(url, context, onSuccess, onError);
        
        function onSuccess(transport) {
            handler(transport.responseXML);
        }
        
        function onError(transport) {
            //TODO
            null;
        }
    },

    getText: function (url, context, handler) {
        //TODO
        null;
    }
});

var FastAPI = new _fastAPI_ezweb();

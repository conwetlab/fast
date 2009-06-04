var _fastAPI = Class.create({
    
    initialize: function() {
    },

    createRGadgetVariable: function ( /** string */ variable, /** string */ method) {
        throw 'Abstract Method invocation. ' + 
              'FastAPI :: createRGadgetVariable';
    },

    createRWGadgetVariable: function ( /** string */ variable) {
        throw 'Abstract Method invocation. ' + 
              'FastAPI :: createRWGadgetVariable';
    },

    getXML: function (url, context, handler) {
        throw 'Abstract Method invocation. ' + 
              'FastAPI :: getXML';
    },
    
    getText: function (url, handler) {
        throw 'Abstract Method invocation. ' + 
              'FastAPI :: getText';
    },
    
    getJson: function (url, handler) {
        throw 'Abstract Method invocation. ' + 
              'FastAPI :: getJson';
    },
    
    getFeed: function (url, handler) {
        throw 'Abstract Method invocation. ' + 
              'FastAPI :: getFeed';
    },
    
    request: function (url, request) {
        throw 'Abstract Method invocation. ' + 
              'FastAPI :: request';
    }
});

var ScreenflowDescription = Class.create(BuildingBlockDescription,
    /** @lends ScreenflowDescription.prototype */ {

    /**
     * Screenflow building block description.
     * @constructs
     * @extends BuildingBlockDescription
     */
    initialize: function($super, /** Hash */ properties) {
        this.definition = new Object();
        this.definition.screens = new Array();
        this.description = new Object();
        this.label = new Object();
        this.domainContext = new Array();
        
        $super(properties);
    },
    
    /**
     * Adds a new screen.
     * @param ScreenDescription
     *      Screen to be added to the
     *      Screenflow document.
     */
    addScreen: function (/** String */ uri, /** Object */ position) {
        this.definition.screens.push({
            "uri":   uri,
            "position": position
        });
    },

    /**
     * Delete a screen.
     * @param ScreenDescription
     *      Screen to be deleted from the
     *      Screenflow document.
     */
    removeScreen: function(/** String */ id) { 
        for (var i=0; i < this.definition.screens.length; i++) {
            if (this.definition.screens[i].uri == id) {
                this.definition.screens.splice(i,1);
                break;
            }
        }
    },
    
    //  TODO: add/removePrePost()
    addPrePost: function() {},
    removePrePost: function() {},
    
    //************************ PRIVATE METHODS *******************//
    /**
     * @type Array
     */
    _getScreenUris: function() {
        var uris = [];
        this.screens.each(function (pair) {
            uris.push(pair.key);
        });
        return uris;
    }
});

// vim:ts=4:sw=4:et: 
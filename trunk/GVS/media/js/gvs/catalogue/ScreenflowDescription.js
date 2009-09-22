var ScreenflowDescription = Class.create(BuildingBlockDescription,
    /** @lends ScreenflowDescription.prototype */ {

    /**
     * Screenflow building block description.
     * TODO: replace with the object the remote catalogue will send
     * @constructs
     * @extends BuildingBlockDescription
     */
    initialize: function($super, /** Hash */ properties) {
        this.screens = new Hash();
        this.description = new Hash();
        this.label = new Hash();
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
        this.screens.set(uri,{
            "screen":   uri,
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
        this.screens.unset(id);
    },
    
    /**
     * @type Array
     */
    getScreenUris: function() {
        var uris = [];
        this.screens.each(function (pair) {
            uris.push(pair.key);
        });
        return uris;
    }
});

// vim:ts=4:sw=4:et: 
var ScreenFactory = Class.create(ResourceFactory,
    /** @lends ScreenFactory.prototype */ {

    /**
     * Factory of screen resources.
     * @constructs
     * @extends ResourceFactory
     */
    initialize: function($super) {
        $super();

        this._resourceType = 'screen';
        this._resourceName = 'Screens';
        this._resourceDescriptions = [];
    },

    // **************** PUBLIC METHODS **************** //

    updateScreenDescriptions: function (screenDescriptions) {
        //TODO no vaciar resourceDescription y hacer comprobación de si estaban o no
        this._resourceDescriptions=[];
        var screen_metadata = screenDescriptions.screen_metadata;
        for (var i=0; i<screen_metadata.length ; i++) {
            this._resourceDescriptions.push(new ScreenDescription (screen_metadata[i]));
        }
    },

    getScreenDescriptions: function (/** Array*/ screenURIs) {
    }


    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et: 

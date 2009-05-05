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


    updateResourceDescriptions: function (screenDescriptions) {

        var screen_metadata = screenDescriptions;
        for (var i=0; i<screen_metadata.length ; i++) {
            this._resourceDescriptions.push(new ScreenDescription (screen_metadata[i]));
        }
    },

    getResources: function (/** Array*/ screenURIs) {
        var screenDescriptions = [];

        for (var i=0; i<screenURIs.length ; i++) {
            for (var j=0; j<this._resourceDescriptions.length ; j++) {
                if (screenURIs[i]==this._resourceDescriptions[j].uri)
                {
                    screenDescriptions.push(this._resourceDescriptions[j]);
                    break;
                }
            }
        }
        return screenDescriptions;
    }


    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et: 

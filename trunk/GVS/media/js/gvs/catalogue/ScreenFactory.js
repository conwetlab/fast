var ScreenFactory = Class.create(ResourceFactory,
    /** @lends ScreenFactory.prototype */ {

    /**
     * Factory of screen resources.
     * @constructs
     * @extends ResourceFactory
     */
    initialize: function($super) {
        $super();
        var cataloguePath = '/fast/images/catalogue/';

        this._resourceType = 'screen';
        this._resourceName = 'Screens';
        // TODO get the screen from the catalogue 
        //this.resourceDescriptions = CatalogueSingleton.getInstance().findScreens(context, elements, criteria);
        this._resourceDescriptions = [
        ];  
    },

    // **************** PUBLIC METHODS **************** //

    updateScreenDescriptions: function (screenDescriptions) {

        this._resourceDescriptions=[];
        var screen_metadata = screenDescriptions.screen_metadata;
        for (var i=0; i<screen_metadata.length ; i++) {
            this._resourceDescriptions.push(new ScreenDescription (screen_metadata[i]));
        }
    }


    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et: 

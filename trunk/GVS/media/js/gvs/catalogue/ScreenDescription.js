var ScreenDescription = Class.create(BuildingBlockDescription,
    /** @lends ScreenDescription.prototype */ {

    /**
     * Screen building block description.
     * TODO: replace with the object the remote catalogue will send
     * @constructs
     * @extends BuildingBlockDescription
     */
    initialize: function($super, /** Hash */ properties) {
        $super(properties);

    },


    /**
     * Creates a new screen component
     * @override
     */
    createPaletteComponent: function (docId) {
        return new ScreenComponent(this, docId);
    },

    /**
     * Creates a new screen view
     * @override
     */
    createView: function () {
        return new ScreenView(this);
    }
});

// vim:ts=4:sw=4:et: 

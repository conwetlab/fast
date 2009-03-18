var ScreenDescription = Class.create(ResourceDescription,
    /** @lends ScreenDescription.prototype */ {

    /**
     * Screen resource description.
     * TODO: replace with the object the remote catalogue will send
     * @constructs
     * @extends ResourceDescription
     */
    initialize: function($super, /** Hash */ properties) {
        $super(properties);

    },


    /**
     * Creates a new screen component
     * @override
     */
    createPaletteComponent: function () {
        return new ScreenComponent(this);
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

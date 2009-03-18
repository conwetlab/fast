var DomainConceptDescription = Class.create(ResourceDescription,
    /** @lends DomainConceptDescription.prototype */ {

    /**
     * Domain Concept resource description.
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
        return new DomainConceptComponent(this);
    },

    /**
     * Creates a new screen view
     * @override
     */    
    createView: function () {
        return new DomainConceptView(this);
    }
});

// vim:ts=4:sw=4:et: 

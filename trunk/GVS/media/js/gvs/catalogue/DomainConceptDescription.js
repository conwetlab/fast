var DomainConceptDescription = Class.create(BuildingBlockDescription,
    /** @lends DomainConceptDescription.prototype */ {

    /**
     * Domain Concept building block description.
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
        return new DomainConceptComponent(this, docId);
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

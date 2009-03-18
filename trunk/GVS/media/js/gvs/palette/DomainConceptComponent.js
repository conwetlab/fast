var DomainConceptComponent = Class.create(PaletteComponent, 
    /** @lends DomainConceptComponent.prototype */ {
        
    /**
     * Palette component of a domain concept resource.
     * @param ResourceDescription domainConceptResourceDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, domainConceptResourceDescription) {

        $super(domainConceptResourceDescription);

    },


    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //
    

    /**
     * Creates a new domain concept to be dragged.
     * @type DomainConceptInstance
     * @override
     */
    _createInstance: function () {
        return new DomainConceptInstance(this._resourceDescription);
    }
});

// vim:ts=4:sw=4:et:

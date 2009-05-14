var DomainConceptComponent = Class.create(PaletteComponent, 
    /** @lends DomainConceptComponent.prototype */ {
        
    /**
     * Palette component of a domain concept resource.
     * @param ResourceDescription domainConceptResourceDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, domainConceptResourceDescription, /** String */ docId) {
        $super(domainConceptResourceDescription, docId);
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
    },
    
    /**
     * Gets the title of the palette component
     * @type String
     * @private
     */
    _getTitle: function() {
        return this._resourceDescription.name;  
    }
});

// vim:ts=4:sw=4:et:

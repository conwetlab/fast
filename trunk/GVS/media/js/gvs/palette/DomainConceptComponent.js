var DomainConceptComponent = Class.create(PaletteComponent, 
    /** @lends DomainConceptComponent.prototype */ {
        
    /**
     * Palette component of a domain concept building block.
     * @param BuildingBlockDescription domainConceptBuildingBlockDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, description, dropZones, inferenceEngine) {
        $super(description, dropZones, inferenceEngine);
    },


    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //
    
    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        return new DomainConceptView(this._buildingBlockDescription);
    },
    
    /**
     * Creates a new domain concept to be dragged.
     * @type DomainConceptInstance
     * @override
     */
    _createInstance: function () {     
        return new PrePostInstance(this._buildingBlockDescription, this._inferenceEngine);
    },
    
    /**
     * @type String
     * @override
     */
    _getTitle: function () {
        return this._buildingBlockDescription.getTitle();
    }
});

// vim:ts=4:sw=4:et:

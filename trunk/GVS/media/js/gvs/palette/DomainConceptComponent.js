var DomainConceptComponent = Class.create(PaletteComponent, 
    /** @lends DomainConceptComponent.prototype */ {
        
    /**
     * Palette component of a domain concept building block.
     * @param BuildingBlockDescription domainConceptBuildingBlockDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, domainConceptBuildingBlockDescription) {
        $super(domainConceptBuildingBlockDescription, docId);
    },


    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //
    

    /**
     * Creates a new domain concept to be dragged.
     * @type DomainConceptInstance
     * @override
     */
    _createInstance: function () {
        var instance = new ConnectorInstance(        
                            new ConnectorDescription ({
                                type: 'None'
                            })
                        );
        var properties = new Hash();
        properties.set('fact',this.getBuildingBlockDescription().name);
        properties.set('type','None');
        properties.set('shortcut',this.getBuildingBlockDescription().shortcut);
        properties.set('semantics',this.getBuildingBlockDescription().semantics);
        // By default, the factAttr of the instance will be 'All atributtes'
        // represented by an empty string in the Engine.js.
        properties.set('factAttr','');
        instance.setProperties(properties);

        return instance;
        //return new DomainConceptInstance(this._buildingBlockDescription);
    },
    
    /**
     * Gets the title of the palette component
     * @type String
     * @private
     */
    _getTitle: function() {
        return this._buildingBlockDescription.name;  
    }
});

// vim:ts=4:sw=4:et:

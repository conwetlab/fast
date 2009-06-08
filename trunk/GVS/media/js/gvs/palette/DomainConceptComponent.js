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
        var instance = new ConnectorInstance(        
                            new ConnectorDescription ({
                                type: 'None'
                            })
                        );
        var properties = new Hash();
        properties.set('fact',this.getResourceDescription().name);
        properties.set('type','None');
        properties.set('shortcut',this.getResourceDescription().shortcut);
        properties.set('semantics',this.getResourceDescription().semantics);
        // By default, the factAttr of the instance will be 'All atributtes'
        // represented by an empty string in the Engine.js.
        properties.set('factAttr','');
        instance.setProperties(properties);

        return instance;
        //return new DomainConceptInstance(this._resourceDescription);
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

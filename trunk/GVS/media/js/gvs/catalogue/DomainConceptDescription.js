var DomainConceptDescription = Class.create(BuildingBlockDescription,
    /** @lends DomainConceptDescription.prototype */ {

    /**
     * Domain Concept building block description.
     * @constructs
     * @extends BuildingBlockDescription
     */
    initialize: function($super, /** Hash */ properties) {
        $super(properties);
    },
    
    /**
     * @override
     */
    getInfo: function() {
        var info = new Hash();
        
        info.set('Label', this.label);
        info.set('Type', this.type);
        info.set('EzWeb Binding', this.binding);

        return info;
    }
});

// vim:ts=4:sw=4:et: 

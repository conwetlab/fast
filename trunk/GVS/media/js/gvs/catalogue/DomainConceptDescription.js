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
     * @override
     */
    getInfo: function() {
        var info = new Hash();
        info.set('name', this.name);
        info.set('description', this.description);
        info.set('semantics', this.semantics);

        return info;

    }
});

// vim:ts=4:sw=4:et: 

var DomainConceptFactory = Class.create(ResourceFactory,
    /** @lends DomainConceptFactory.prototype */ {

    /**
     * Factory of domain concept resources.
     * @constructs
     * @extends ResourceFactory
     */
    initialize: function($super) {
        $super();

        this._resourceType = 'domainConcept';
        this._resourceName = 'Domain Concepts';
        this._resourceDescriptions = [];
    },


    // **************** PUBLIC METHODS **************** //

    updateResourceDescriptions: function (domainConceptDescriptions) {
        for (var i=0; i<domainConceptDescriptions.length ; i++) {
            var already_exists = false;
            for (var j=0; j<this._resourceDescriptions.length; j++) {
                if(this._resourceDescriptions[j].name==domainConceptDescriptions[i].name){
                    already_exists = true;
                }
            }
            if(!already_exists){
                this._resourceDescriptions.push(new DomainConceptDescription (domainConceptDescriptions[i]));
            }
        }
    },

    getResources: function (/** Array*/ resourceIds) {
    }
});

// vim:ts=4:sw=4:et: 

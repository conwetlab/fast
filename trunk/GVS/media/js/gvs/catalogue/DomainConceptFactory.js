var DomainConceptFactory = Class.create(ResourceFactory,
    /** @lends DomainConceptFactory.prototype */ {

    /**
     * Factory of domain concept resources.
     * @constructs
     * @extends ResourceFactory
     */
    initialize: function($super) {
        $super();
        var cataloguePath = 'images/catalogue/';

        this._resourceType = 'domainConcept';
        this._resourceName = 'Domain Concepts';
        this._resourceDescriptions = [

        ];
    }
});

// vim:ts=4:sw=4:et: 

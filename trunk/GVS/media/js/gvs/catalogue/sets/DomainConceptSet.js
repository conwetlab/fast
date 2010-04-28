var DomainConceptSet = Class.create(BuildingBlockSet, /** @lends DomainConceptSet.prototype */ {
    /**
     * This class handles a set of building blocks for a given context.
     * This list will be updated.
     * @constructs
     * @extends BuildingBlockSet
     */
    initialize: function($super, /** Array */ tags, /** DomainConceptFactory */ factory) {
        $super(tags, factory);

        /**
         * Domain concepts
         * @type Array
         * @private
         */
        this._domainConcepts = new Array();

    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Starts the data retrieval of the domain concepts
     */
    startRetrievingData: function() {
        this._factory.getBuildingBlocks(this._tags, this._onSuccess.bind(this));
    },


    /**
     * Returns all the building block descriptions from the set
     * @type Array
     * @override
     */
    getBuildingBlocks: function () {
        return this._domainConcepts;
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * @private
     */
    _onSuccess: function(/** Array */ domainConcepts) {
        this._domainConcepts = domainConcepts;
        this._listener.setChanged();
    }
});

// vim:ts=4:sw=4:et:

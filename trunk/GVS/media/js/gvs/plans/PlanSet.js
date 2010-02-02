var PlanSet = Class.create(BuildingBlockSet, /** @lends PlanSet.prototype */ {
    /**
     * This class handles a set of building blocks for a given context.
     * This list will be updated.
     * @constructs
     * @extends BuildingBlockSet
     */ 
    initialize: function($super) {
        $super([]);
        
        /** 
         * List of Plans
         * @type Array
         * @private @member
         */
        this._plans = new Array();
               
        
        this._factory = Catalogue.
            getBuildingBlockFactory(Constants.BuildingBlock.SCREEN);
    },
    

    // **************** PUBLIC METHODS **************** //

    
    /**
     * Returns all the building blocks ordered by plan from the set
     * @type Array
     * @override
     */
    getBuildingBlocks: function () {
        var result = new Array();
        this._plans.each(function(plan) {
            result.push(this._factory.getBuildingBlocks(plan));    
        }.bind(this));
        return result;
    },
    
    /**
     * Add new building blocks to the set by uri
     */
    setPlans: function (/** Array */ plans) {
        this._plans = plans.splice(0,10); //Just in case
        var uris = this._plans.flatten().uniq();
        this._factory.cacheBuildingBlocks(uris, this._cachedElements.bind(this));
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * This is the callback called when returning from the 
     * building block factory
     */
    _cachedElements: function () {
        this._listener.setChanged();
    }
    
});

// vim:ts=4:sw=4:et:

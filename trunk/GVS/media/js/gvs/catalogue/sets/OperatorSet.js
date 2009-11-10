var OperatorSet = Class.create(BuildingBlockSet, /** @lends OperatorSet.prototype */ {
    /**
     * This class handles a set of building blocks for a given context.
     * This list will be updated.
     * @constructs
     * @extends BuildingBlockSet
     */ 
    initialize: function($super, /** Array */ context) {
        $super(context);
        
        /**
         * Domain concepts
         */
        this._operators = new Array();
        
        this._factory = CatalogueSingleton.getInstance().
            getBuildingBlockFactory(Constants.BuildingBlock.OPERATOR);
    },
    

    // **************** PUBLIC METHODS **************** //

    /**
     * @override
     */
    startRetrievingData: function() {
        this._factory.getBuildingBlocks(this._context, this._onSuccess.bind(this));
    },
    
    
    /**
     * Returns all the building block descriptions from the set
     * @type Array
     */
    getBuildingBlocks: function () {
        return this._operators;
    },
    
    // **************** PRIVATE METHODS **************** //
    
    _onSuccess: function(/** Array */ operators) {
        this._operators = operators;
        this._listener.setChanged();
    }
});

// vim:ts=4:sw=4:et:

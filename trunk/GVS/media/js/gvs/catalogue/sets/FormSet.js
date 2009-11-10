var FormSet = Class.create(BuildingBlockSet, /** @lends FormSet.prototype */ {
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
        this._forms = new Array();
        
        this._factory = CatalogueSingleton.getInstance().
            getBuildingBlockFactory(Constants.BuildingBlock.FORM);
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
        return this._forms;
    },
    
    // **************** PRIVATE METHODS **************** //
    
    _onSuccess: function(/** Array */ forms) {
        this._forms = forms;
        this._listener.setChanged();
    }
});

// vim:ts=4:sw=4:et:

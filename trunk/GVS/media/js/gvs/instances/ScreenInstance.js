var ScreenInstance = Class.create(ComponentInstance,
    /** @lends ScreenInstance.prototype */ {

    /**
     * Screen instance.
     * @constructs
     * @extends ComponentInstance
     */
    initialize: function($super, /**BuildingBlockDescription*/ buildingBlockDescription, 
            /** Array */ dropZones, /** InferenceEngine */ inferenceEngine) {
        $super(buildingBlockDescription, dropZones, inferenceEngine);
        
        /**
         * @type PreviewDialog
         * @private @member
         */
        this._dialog = null;
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Somehow something the user can comprehend
     * @override
     */
    getTitle: function() {
        return this._buildingBlockDescription.label['en-gb'];    
    },
    /**
     * @override
     */
    getInfo: function() {
        var info = new Hash();
        info.set('Title', this._buildingBlockDescription.label['en-gb']);
        info.set('Description', this._buildingBlockDescription.description['en-gb']);
        info.set('Tags', this._buildingBlockDescription.domainContext.tags.join(", "));
        return info;
    },
    
    /**
     * This function shows the dialog to change
     * the instance properties
     */
    showPreviewDialog: function () {
        if (!this._dialog) {
            this._dialog = new PreviewDialog(this.getTitle(), this._buildingBlockDescription.getPreview());
        }
        this._dialog.show();        
    },
    
    /**
     * This function returns a list with all the 
     * preconditions of the instance, 
     * ready to be set in the FactPane
     * @type Array
     */
    getPreconditionTable: function(/** Hash */ reachability) {
        return this._getConditionList("preconditions", reachability);    
    },
    
    /**
     * This function returns a list with all the 
     * postconditions of the instance, 
     * ready to be set in the FactPane
     * @type Array
     */
    getPostconditionTable: function(/** Boolean */ reachability) {
        return this._getConditionList("postconditions", reachability);     
    },

    // **************** PRIVATE METHODS **************** //
    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        return new ScreenView(this._buildingBlockDescription);
    },

    /**
     * This function is called when the attached view is dbl-clicked
     * @private
     * @override
     */
    _onDoubleClick: function (/** Event */ event){
        this.showPreviewDialog(); 
    },
    
    /**
     * Creates the data hash to be passed to the
     * table
     * @private
     * @type Array
     */
    _getConditionList: function(/** String */ type, /** Hash | Boolean */ reachability) {
        
        if (this._buildingBlockDescription[type].length > 1){ //More than one set of conditions
            console.log("OR support not implemented yet");
            return null;
        }
        else {
            var conditions = this._buildingBlockDescription[type][0];
            
            var factFactory = FactFactorySingleton.getInstance();
    
            var result = new Array();  
            $A(conditions).each( 
                function(condition) {
                    var uri = factFactory.getFactUri(condition);
                    
                    var fact = factFactory.getFactIcon(condition, "embedded").getNode();
                    if (reachability.constructor == Hash) {
                        Utils.setSatisfeabilityClass(fact, reachability.get(uri));
                    } else {
                        Utils.setSatisfeabilityClass(fact, reachability);
                    }
                    
                    var description = condition.label['en-gb'];
                   
                    result.push([fact, description, uri]);
                    
                }.bind(this)
            );
            return result;         
        }
    } 
});

// vim:ts=4:sw=4:et:

var OperatorComponent = Class.create(PaletteComponent,
    /** @lends OperatorComponent.prototype */ {

    /**
     * Palette component of a domain concept building block.
     * @param BuildingBlockDescription OperatorBuildingBlockDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, description, dropZones, inferenceEngine) {
        $super(description, dropZones, inferenceEngine);
        this._inferenceEngine.addReachabilityListener(this._buildingBlockDescription.uri,this);
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Colorize the component depending on the reachability
     * @public
     */
    setReachability: function( /** Boolean */ highlight) {
        if (highlight) {
            this._hover.setStyle({"opacity": "1"});
            dojo.fadeOut({
                "duration": 2500,
                "node": this._hover
            }).play(2500);
        }
    },


    // **************** PRIVATE METHODS **************** //

    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        var view = new OperatorView(this._buildingBlockDescription);
        this._createTooltip(view.getNode(), this._buildingBlockDescription);
        return view;
    },

    /**
     * Creates a new Operator to be dragged.
     * @type OperatorInstance
     * @override
     */
    _createInstance: function () {
        return new OperatorInstance(this._buildingBlockDescription, this._inferenceEngine);
    },

    /**
     * @type String
     * @override
     */
    _getTitle: function () {
        return this._buildingBlockDescription.label['en-gb'];
    },

    /**
     * This function returns a list with all the
     * preconditions of the component.
     * @type Array
     * @override
     */
    _getPreConditions: function() {
        var result = [];
        var actions = this._buildingBlockDescription.actions;
        for (var i=0; actions && i < actions.length; i++) {
            var preconditions = actions[i].preconditions;
            for (var j=0; preconditions && j < preconditions.length; j++) {
                result.push(preconditions[j]);
            }
        }
        return result;
    }

});

// vim:ts=4:sw=4:et:

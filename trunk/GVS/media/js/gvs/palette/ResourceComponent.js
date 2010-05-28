var ResourceComponent = Class.create(PaletteComponent,
    /** @lends ResourceComponent.prototype */ {

    /**
     * Palette component of a domain concept building block.
     * @param BuildingBlockDescription ResourceBuildingBlockDescription
     * @constructs
     * @extends PaletteComponent
     */
    initialize: function($super, description, dropZones, inferenceEngine) {
        $super(description, dropZones, inferenceEngine);
    },


    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //

    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        var view = new ResourceView(this._buildingBlockDescription);
        this._createTooltip(view.getNode(), this._buildingBlockDescription);
        return view;
    },

    /**
     * Creates a new resource to be dragged.
     * @type ResourceInstance
     * @override
     */
    _createInstance: function () {
        return new ResourceInstance(this._buildingBlockDescription, this._inferenceEngine);
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

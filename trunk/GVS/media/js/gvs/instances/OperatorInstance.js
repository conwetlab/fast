var OperatorInstance = Class.create(ScreenComponentInstance,
    /** @lends OperatorInstance.prototype */ {

    _preOffsetPosition:  {top:6, left:0},
    _postOffsetPosition: {top:-10, left:2},

    initialize:function($super, buildingBlockDescription, inferenceEngine) {
        $super(buildingBlockDescription, inferenceEngine);
        this._menu.addOption('Rotate', function() {
            this.document.rotateElement(this);
        }.bind(this));
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * On rotate
     * @override
     */
    onRotate: function(/** Number */ orientation) {
        this.updateTerminals();
    },

    // **************** PRIVATE METHODS **************** //

    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        return new OperatorView(this._buildingBlockDescription, this._orientation);
    }

});

// vim:ts=4:sw=4:et:

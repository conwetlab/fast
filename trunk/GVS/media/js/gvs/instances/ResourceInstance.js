var ResourceInstance = Class.create(ScreenComponentInstance,
    /** @lends ResourceInstance.prototype */ {

    _preOffsetPosition:  {top:-6, left:4},
    _postOffsetPosition: {top:-6, left:4},

    // **************** PRIVATE METHODS **************** //

    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        return new ResourceView(this._buildingBlockDescription);
    }

});

// vim:ts=4:sw=4:et:

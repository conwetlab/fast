var ScreenInstance = Class.create(ComponentInstance,
    /** @lends ScreenInstance.prototype */ {

    /**
     * Screen instance.
     * @constructs
     * @extends ComponentInstance
     */
    initialize: function($super, /**BuildingBlockDescription*/ buildingBlockDescription, 
            /** DropZone */ dropZone, /** InferenceEngine */ inferenceEngine) {
        $super(buildingBlockDescription, dropZone, inferenceEngine);
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
        info.set('Concepts', this._buildingBlockDescription.domainContext.tags);
        return info;
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
        GVSSingleton.getInstance().getDocumentController().createPreviewDocument(this.getBuildingBlockDescription());
    }
});

// vim:ts=4:sw=4:et:

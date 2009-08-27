var ScreenInstance = Class.create(ComponentInstance,
    /** @lends ScreenInstance.prototype */ {

    /**
     * Screen instance.
     * @constructs
     * @extends ComponentInstance
     */
    initialize: function($super, /**BuildingBlockDescription*/ buildingBlockDescription) {
        $super(buildingBlockDescription);
        var uidGenerator = UIDGeneratorSingleton.getInstance();
        this._id = uidGenerator.generate("screenInstance");
        this._buildingBlockType = Constants.BuildingBlock.SCREEN;
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Colorize the component depending on the reachability
     * @public
     */
    colorize: function(){
        this.getView().colorize(this.getBuildingBlockDescription().satisfeable);
    },

    /**
     * Drop event handler for the DragSource
     * @param finishState
     *      True if a new ScreenInstance has
     *      been added to the new zone.
     * @override
     */
    onDragFinish: function($super, finishState) {
        $super(finishState);
        // FIXME: remove this
        if(finishState) {
            var currentDocument = GVSSingleton.getInstance().getDocumentController().getCurrentDocument();
            currentDocument.addScreen(this);           
        }
    },

    // **************** PRIVATE METHODS **************** //
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

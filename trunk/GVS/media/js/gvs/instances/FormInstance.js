var FormInstance = Class.create(ScreenComponentInstance,
    /** @lends FormInstance.prototype */ {

    _preOffsetPosition:  {top:6, left:2},
    _postOffsetPosition: {top:9, left:2},

    initialize:function($super, buildingBlockDescription, inferenceEngine) {
        $super(buildingBlockDescription, inferenceEngine);
        this._menu.addOption('Preview', this.showPreviewDialog.bind(this));
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * This function shows the dialog to change
     * the instance properties
     */
    showPreviewDialog: function () {
        if (! this._dialog) {
            var title = this.getTitle();
            var preview = this._buildingBlockDescription.getPreview();
            this._dialog = new PreviewDialog(title, preview);
        }
        this._dialog.show();
    },

    // **************** PRIVATE METHODS **************** //
    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        return new FormView(this._buildingBlockDescription);
    },

    /**
     * This function is called when the attached view is dbl-clicked
     * @private
     * @override
     */
    _onDoubleClick: function (/** Event */ event){
        this.showPreviewDialog();
    }

});

// vim:ts=4:sw=4:et:

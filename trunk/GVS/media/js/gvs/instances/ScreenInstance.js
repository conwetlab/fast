var ScreenInstance = Class.create(ComponentInstance,
    /** @lends ScreenInstance.prototype */ {

    /**
     * Screen instance.
     * @constructs
     * @extends ComponentInstance
     */
    initialize: function($super, /**BuildingBlockDescription*/ buildingBlockDescription,
             /** InferenceEngine */ inferenceEngine) {
        $super(buildingBlockDescription, inferenceEngine);

        /**
         * @type PreviewDialog
         * @private @member
         */
        this._dialog = null;
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * @override
     */
    getInfo: function() {
        var info = new Hash();
        info.set('Title', this._buildingBlockDescription.label['en-gb']);
        info.set('Description', this._buildingBlockDescription.description['en-gb']);
        info.set('Tags', this._buildingBlockDescription.tags.collect(function(tag) {
                return tag.label['en-gb'];
            }).join(", "));
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
    }
});

// vim:ts=4:sw=4:et:

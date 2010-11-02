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

        this._menu.addOption('Preview', function(){
            this.showPreviewDialog();
        }.bind(this));
        if (this.getBuildingBlockDescription().definition != null) {
            this._menu.addOption('Clone', function(){
                this.document.cloneElement(this);
            }.bind(this));
        }
        this._menu.addOption('Create a Plan', function(){
            this.document.getPlansElement(this);
        }.bind(this));

        /**
         * Screen caption (optional
         * @private
         * @type String
         */
        this._caption = null;
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * @override
     */
    getInfo: function() {
        var info = new Hash();
        var titleDialog = new TitleDialog(this.getTitle(),
                                          this.setTitle.bind(this));
        var titleArea = new Element("div");
        var titleText = new Element("span").update(this.getTitle());
        titleArea.appendChild(titleText);
        titleArea.appendChild(titleDialog.getButtonNode());
        info.set('Title', titleArea);

        info.set('Description', this._buildingBlockDescription.description['en-gb']);

        var captionDialog = new CaptionDialog(this._caption,
                                          this.setCaption.bind(this));
        var captionArea = new Element("div");
        var captionText;
        if (this._caption != null) {
            captionText = new Element("span");
            var showedText = this._caption.stripTags().substring(0,10);
            if (showedText != this._caption.stripTags()) {
                // The caption is longer than 10 chars
                showedText += "...";
            }
            captionText.update(showedText);
        } else {
            captionText = new Element("span", {
                "class":"triggerInfo"
            }).update("No caption set");
        }
        captionArea.appendChild(captionText);
        captionArea.appendChild(captionDialog.getButtonNode());
        info.set('Screen caption', captionArea);

        info.set('Tags', this._buildingBlockDescription.tags.collect(function(tag) {
                return tag.label['en-gb'];
            }).join(", "));
        return info;
    },

    /**
     * Returns the caption of the screen if any
     */
    getCaption: function() {
        return this._caption;
    },

    /**
     * sets the caption
     */
    setCaption: function(/** String  */ caption) {
        this._caption = caption.stripScripts();

        if (this._listener && this._listener.modified) {
            this._listener.modified(this);
        }
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

var ScreenflowPlayer = Class.create( /** @lends ScreenflowPlayer.prototype */ {
    /**
     * On charge of playing screenflows
     * @constructs
     */
    initialize: function() {

        /**
         * @type ScreenflowDescription
         * @private @member
         */
        this._description = null;

        /**
         * @type PreviewDialog
         * @private @member
         */
        this._dialog = null;
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * Shows the Screenflow execution
     * @public
     */
    playScreenflow: function (/** ScreenflowDescription */ description) {
        this._description = description;

        if (!this._dialog) {
            var title = this._description.name;

            this._dialog = new PreviewDialog(title, this._getPreview());
        } else {
            this._dialog._setContent(this._getPreview());
        }
        this._dialog.show();

    },

    // **************** PRIVATE METHODS **************** //

    /**
     * This method creates a DOM Node with the preview
     * of the Screenflow
     * @type DOMNode
     */
    _getPreview: function() {
        var node = new Element('div', {
            'class': 'player'
        });
        var errorField = new Element('div', {
            'class': 'error'
        });
        node.appendChild(errorField);

        var obj = new Element ('object', {
            'data': URIs.storePlayScreenflow + "?screenflow=" + this._description.getId(),
            'class': 'embed'
        });

        node.appendChild(obj);
        return node;
    }

});

// vim:ts=4:sw=4:et:

var StandaloneEmbeddingDialog = Class.create(ConfirmDialog /** @lends PreviewDialog.prototype */, {
    /**
     * This class handles the dialog
     * to preview a component
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, /** String */ title, /** String url */ url) {

        /**
         * URL to embed
         * @private
         * @type String
         */
        this._url = url;

        $super('Embedding of ' + title + ' Standalone Gadget', ConfirmDialog.OK);
        this._setContent(content);
    },


    // **************** PUBLIC METHODS **************** //

    // **************** PRIVATE METHODS **************** //

    /**
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @override
     */
    _initDialogInterface: function () {

        var formData = [
            {'type':'title', 'value': 'Please, embed this HTML code into your web page:'},
            {'type':'pre', 'value': this._getEmbedding()}
        ];

        this._setContent(formData);

    },

    /**
     * initDialogInterface
     * This function creates the dom structure and
     * @private
     * @override
     */
    _getEmbedding: function () {
        return ('<object data="' + this._url + '" height="600" width="400" class="embed"></object>').escapeHTML();
    }

});

// vim:ts=4:sw=4:et:
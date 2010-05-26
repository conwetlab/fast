var StandaloneEmbeddingDialog = Class.create(ConfirmDialog /** @lends PreviewDialog.prototype */, {
    /**
     * This class handles the dialog
     * to preview a component
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, /** Object */ publication, /** String */ url) {

        /**
         * URL to embed
         * @private
         * @type String
         */
        this._url = url;

        /**
         * Publication info
         * @private
         * @type Object
         */
        this._publication = publication;

        $super(this._getDialogTitle(this._publication.name), ConfirmDialog.OK);
        this._setContent(content);
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * updateDialog
     * Updates dialog header and content
     * @public
     */
    updateDialog: function (/** Object */ publication, /** String */ url) {
        this._url = url;
        this._publication = publication;
        this._initDialogInterface();
        this._setTitle(this._getDialogTitle(this._publication.name), null);
    },

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
     * getEmbedding
     * This function creates the dom structure and
     * @private
     * @override
     */
    _getEmbedding: function () {
        var height = this._publication.height;
        if (!height || height == ''){
            height = '600';
        }
        var width = this._publication.width;
        if (!width || width == ''){
            width = '400';
        }
        return ('<object data="' + this._url + '" height="'+ height
                + '" width="' + width + '" class="embed"></object>').escapeHTML();
    },

    /**
     * getDialogTitle
     * This function returns the dialog title
     * @private
     * @override
     */
    _getDialogTitle: function (/** String */ name) {
        return 'Embedding of ' + name + ' Standalone Gadget';
    }

});

// vim:ts=4:sw=4:et:
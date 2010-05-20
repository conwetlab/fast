var PreviewDialog = Class.create(ConfirmDialog /** @lends PreviewDialog.prototype */, {
    /**
     * This class handles the dialog
     * to preview a component
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, /** String */ title, /** DOMNode */ content) {
        $super("Preview of " + title, ConfirmDialog.OK);
        this._setContent(content);
    },


    // **************** PUBLIC METHODS **************** //

    /**
     * This function set the form content based on a array-like
     * structure, containing the different elements of the form,
     * and, optionally, form parameters
     * @private
     */
    setContent: function (/** Array | DOMNode */ data, /** Hash */ formParams){
        this._setContent(data, formParams);
    }

    // **************** PRIVATE METHODS **************** //

});

// vim:ts=4:sw=4:et:

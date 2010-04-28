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


    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function () {
    }
});

// vim:ts=4:sw=4:et:

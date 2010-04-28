var ExternalContentDialog = Class.create(ConfirmDialog /** @lends ExternalContentDialog.prototype */, {
    /**
     * This class handles a dialog
     * whose content is an external content,
     * normally coming from an AJAX call
     * @constructs
     * @extends ConfirmDialog
     */
    initialize: function($super, title) {
        $super(title, ConfirmDialog.NONE);
    },

    // **************** PUBLIC METHODS **************** //


    /**
     * show
     * @override
     */
    show: function ($super, /** DOMNode */ content) {
        $super();
        this._setContent(content);
    },

    // **************** PRIVATE METHODS **************** //


    /**
     * initDialogInterface
     * This function creates the dom structure
     * @private
     * @override
     */
    _initDialogInterface: function () {
        //Do nothing
    }
});

// vim:ts=4:sw=4:et:

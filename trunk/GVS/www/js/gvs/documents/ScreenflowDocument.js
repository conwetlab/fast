var ScreenflowDocument = Class.create(AbstractDocument,
    /** @lends ScreenflowDocument.prototype */ {

    /**
     * Screenflow document.
     * @constructs
     * @extends AbstractDocument
     */
    initialize: function($super, /** String */ title) {
        $super(title);
        this._tabContent.addClassName('screenflow');
        this._validResources = ['screen','flowControl'];
    }


    // **************** PUBLIC METHODS **************** //


    // **************** PRIVATE METHODS **************** //
});

// vim:ts=4:sw=4:et:

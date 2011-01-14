var ToolbarSeparator = Class.create( /** @lends ToolbarSeparator.prototype */ {
    /**
     * Wrapper of dijit.ToolbarSeparator
     */
    initialize: function () {
        /**
         * The button Widget
         * @type dijit.form.Button
         * @private @member
         */
        this._widget = new dijit.ToolbarSeparator();
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Returns the button widget
     * @type dijit.form.Button
     */
    getWidget: function () {
        return this._widget;
    }
});

// vim:ts=4:sw=4:et:

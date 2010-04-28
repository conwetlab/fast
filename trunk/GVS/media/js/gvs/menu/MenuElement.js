var MenuElement = Class.create( /** @lends MenuElement.prototype */ {
    /**
     * Element for a menu
     * @constructs
     * @abstract
     */
    initialize: function(/** Number */ weight) {
        /**
         * The button Widget
         * @type dijit.*
         * @private
         */
        this._widget = null;

        /**
         * Ordering weight, the lower, the sooner the menu element
         * appears within a menu group
         * @type Number
         * @private
         */
        this._weight = weight;
        if (!this._weight) {
            this._weight = MenuElement.MAXIMUM_WEIGHT;
        }
    },


    // **************** PUBLIC METHODS **************** //


    /**
     * Returns the  widget
     * @type dijit.*
     */
    getWidget: function () {
        return this._widget;
    },

    /**
     * Returns the weight
     * @type Number
     */
    getWeight: function() {
        return this._weight;
    },

    /**
     * Register key handlers
     * @abstract
     */
    register: function(/** KeyPressRegistry */ registry) {
        throw "Abstract method invocation. MenuElement::register";
    },

    /**
     * Unregister key handlers and destroy the
     * widgets when necessary
     * @abstract
     */
    unregister: function(/** KeyPressRegistry */ registry) {
        throw "Abstract method invocation. MenuElement::unregister";
    }
});
// *************** CONSTANTS **************//
MenuElement.MAXIMUM_WEIGHT = 10000;
// vim:ts=4:sw=4:et:

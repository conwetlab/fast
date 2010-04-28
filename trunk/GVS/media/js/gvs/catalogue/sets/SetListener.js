var SetListener = Class.create( /** @lends SetListener.prototype */ {
    /**
     * This class is an interface
     * @constructs
     */
    initialize: function() {
    },

    /**
     * This function is called when a
     * Building Block set changes
     */
    setChanged: function () {
        throw "Abstract method invocation: SetListener::setChanged";
    }

});

// vim:ts=4:sw=4:et:

var Trigger = Class.create(
    /** @lends Trigger.prototype */ {

    /**
     * Triggers representation
     * @constructs
     */ 
    initialize: function (/** Object */ representation) {

        /**
         * Trigger representation
         * @private
         * @type Object
         */
        this._representation = representation;

        /**
         * Trigger id
         */
        this._id = this._createId(representation);
    },

    /**
     * Returns the trigger id
     * @type String
     */
    getId: function() {
        return this._id;
    },

    getDestinationId: function() {
        return this._representation.to.buildingblock;
    },

    getDestinationAction: function() {
        return this._representation.to.action;
    },

    getTriggerName: function() {
        return this._representation.from.name;
    },

    getSourceId: function() {
        return this._representation.from.buildingblock;
    },

    /**
     * Returns the JSON object representing the Trigger
     */
    toJSON: function() {
        return this._representation;
    },
    
    // **************** PRIVATE METHODS **************** //

    /**
     * Creates the trigger id
     * @private
     * @type String
     */
    _createId: function (/** Object */ representation) {
        return representation.from.buildingblock + representation.from.name +
            representation.to.buildingblock + representation.to.action;
    }

});

// vim:ts=4:sw=4:et:

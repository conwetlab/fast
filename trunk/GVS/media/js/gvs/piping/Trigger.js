var Trigger = Class.create(
    /** @lends Trigger.prototype */ {

    /**
     * Triggers representation
     * @constructs
     */ 
    initialize: function (/** Object */ from, /** Object */ to) {

        /**
         * Trigger source
         * @private
         * @type Object
         */
        this._from = from;

        /**
         * Trigger destination
         * @prvate
         * @type Object
         */
        this._to = to;

        /**
         * Trigger id
         * @private
         * @type String
         */
        this._id = this._createId(from, to);
    },

    /**
     * Returns the trigger id
     * @type String
     */
    getId: function() {
        return this._id;
    },

    getDestinationId: function() {
        return this._to.instance.getId();
    },

    getDestinationAction: function() {
        return this._to.action;
    },

    getTriggerName: function() {
        return this._from.name;
    },

    getSourceId: function() {
      var id;
        if (this._from.instance == Trigger.SCREEN_ID) {
            id = this._from.instance;
        } else {
            id = this._from.instance.getId();
        }
        return id;
    },

    getSourceInstance: function() {
        return this._from.instance;
    },

    /**
     * Returns the JSON object representing the Trigger
     */
    toJSON: function() {
        return {
            'from': {
                'buildingblock': this.getSourceId(),
                'name': this.getTriggerName()
            },
            'to': {
                'buildingblock': this.getDestinationId(),
                'action': this.getDestinationAction()
            }
        };
    },
    
    // **************** PRIVATE METHODS **************** //

    /**
     * Creates the trigger id
     * @private
     * @type String
     */
    _createId: function (/** Object */ from, /** Object */ to) {
        var id;
        if (from.instance == Trigger.SCREEN_ID) {
            id = from.instance + from.name + to.instance.getId() + to.action;
        } else {
            id = from.instance.getId() + from.name +
                to.instance.getId() + to.action;
        }
        return id;
    }

});

// Class attributes
Trigger.SCREEN_ID = "screen";
Trigger.SCREEN_ONLOAD = "_onload";

// vim:ts=4:sw=4:et:

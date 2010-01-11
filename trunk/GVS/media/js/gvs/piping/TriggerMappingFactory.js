var TriggerMappingFactory = Class.create(
    /** @lends TriggerMappingFactory.prototype */ {

    /**
     * It handles the connection and deconnection of actions and triggers
     * for a screen
     * @constructs
     */ 
    initialize: function () {
        /**
         * This contains all the triggers in the screen
         * @type Hash
         * @private
         */
        this._triggers = new Hash();
    },
    // **************** PUBLIC METHODS ***************** //

    /**
     * Creates a new trigger mapping coming from a created pipe.
     * @type Trigger
     */
    createTrigger: function (/** Object */ element) {
        var trigger = this._createFromJSON(element);
        this._triggers.set(trigger.getId(), trigger);
        return trigger;
    },

    /**
     * Removes a trigger from the list. The trigger can be passed as
     * parameter
     * @type Trigger
     */
    removeTrigger: function(/** Object */ element) {
        var trigger = this._createFromJSON(element);
        this._triggers.unset(trigger.getId());
        return trigger;
    },

    /**
     * Returns a list of triggers that the instance has connected to each of its
     * actions
     * @type Hash
     */
    getTriggerList: function(/** ComponentInstance */ instance) {
        var result = new Hash();
        this._triggers.values().each(function(trigger) {
           if (trigger.getDestinationId() == instance.getId()) {
               var array = result.get(trigger.getDestinationAction());
               if (!array) {
                   array = new Array();
               }
               array.push(trigger);
               result.set(trigger.getDestinationAction(), array);
           }
        });
        return result;
    },
    
    // **************** PRIVATE METHODS **************** //

    /**
     * @private
     */
    _createFromJSON: function(element) {
        return new Trigger(element.from, element.to);
    }
});
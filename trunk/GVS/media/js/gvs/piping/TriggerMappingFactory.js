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
    createTrigger: function (/** Pipe | Object */ element) {
        var trigger;
        if (element.constructor == Pipe) {
            trigger = this._getTriggerFromPipe(element);
        } else {
            // TODO
        }
        if (trigger) {
            this._triggers.set(trigger.getId(), trigger);
            return trigger;
        } else {
            return null;
        }
    },

    /**
     * Removes a trigger from the list. The trigger can be passed as
     * parameter
     * @type Trigger
     */
    removeTrigger: function(/** Pipe | Trigger */ element) {
        var trigger;
        if (element.constructor == Pipe) {
            trigger = this._getTriggerFromPipe(element);
        } else {
            trigger = element;
        }
        if (trigger) {
            this._triggers.unset(trigger.getId());
            return trigger;
        } else {
            return null;
        }
        
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
     * This function returns a trigger object built automatically from a Pipe,
     * if it is possible (the source only have one trigger element)
     * @private
     * @type Trigger
     */
    _getTriggerFromPipe: function(/** Pipe */ pipe) {
        if (pipe.getSource().getInstance().getBuildingBlockDescription().triggers.length == 1) {
            var triggerData = {
                'from': {
                    'buildingblock': pipe.getSource().getBuildingBlockId(),
                    'name': pipe.getSource().getInstance().getBuildingBlockDescription().triggers[0]
                },
                'to': {
                    'buildingblock': pipe.getDestination().getBuildingBlockId(),
                    'action': pipe.getDestination().getActionId()
                }
            }
            return new Trigger(triggerData);
        } else {
            return null;
        }
    }
});
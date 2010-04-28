var ScreenTrigger = Class.create(Trigger,
    /** @lends ScreenTrigger.prototype */ {

    /**
     * Screen onload Triggers representation
     * @constructs
     * @extends Trigger
     */
    initialize: function ($super, /** Object */ to) {
        var from = {
            'instance': ScreenTrigger.INSTANCE_NAME,
            'name': ScreenTrigger.ONLOAD
        };
        $super(from, to);
    },

    /**
     * @override
     */
    getSourceId: function() {
        return this._from.instance;
    },

    /**
     * @override
     */
    getSourceInstance: function() {
        var fakeInstance = {
            getTitle: function() {
                return ScreenTrigger.INSTANCE_NAME;
            },
            getId: function() {
                return ScreenTrigger.INSTANCE_NAME;
            }
        };
        return fakeInstance;
    },


    /**
     * Returns the JSON object representing the Trigger
     * @type Object
     * @override
     */
    toJSON: function() {
        return {
            'from': {
                'buildingblock': "",
                'name': "_onload"
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
     * @override
     * @type String
     */
    _createId: function (/** Object */ from, /** Object */ to) {
        return from.instance + from.name + to.instance.getId() + to.action;
    }
});

// Class attributes
ScreenTrigger.INSTANCE_NAME = "Screen";
ScreenTrigger.ONLOAD = "onload";
// vim:ts=4:sw=4:et:

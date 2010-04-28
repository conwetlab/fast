var PlanInstance = Class.create(ComponentInstance,
    /** @lends PlanInstance.prototype */ {

    /**
     * Plan instance.
     * @constructs
     * @extends ComponentInstance
     */
    initialize: function($super, /** Array */ plan,
            /** Array */ dropZones, /** InferenceEngine */ inferenceEngine) {

        /**
         * The plan
         * @type Array
         * @private
         */
        this._plan = plan;

        $super([], dropZones, inferenceEngine);
    },

    // **************** PUBLIC METHODS **************** //

    /**
     * Somehow something the user can comprehend
     * @override
     */
    getTitle: function() {
        return "";
    },
    /**
     * @override
     */
    getInfo: function() {
        return new Hash();
    },

    /**
     * @override
     */
    getUri: function() {
        return "";
    },

    /**
     * Returns the plan
     * @type Array
     */
    getPlanElements: function() {
        return this._plan;
    },

    // **************** PRIVATE METHODS **************** //
    /**
     * Creates a new View instance for the component
     * @type BuildingBlockView
     * @override
     */
    _createView: function () {
        return new PlanView(this._plan);
    }
});

// vim:ts=4:sw=4:et:

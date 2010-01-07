var PipeFactory = Class.create(
    /** @lends PipeFactory.prototype */ {

    /**
     * Handles all pipes for a given screenflow
     * @constructs
     */ 
    initialize: function () {
        /**
         * Hash containing all the pipes for the screen
         */
        this._pipes = new Hash();
    },

    /**
     * Returns a pipe instance from the wire element
     */
    getPipe: function (/** WireIt.Wire */ wire) {
        var pipe = null;       
        var source = wire.terminal1;
        var destination = wire.terminal2;
        var id = this._getPipeId(source, destination);
        pipe = new Pipe(wire, id);
        if (pipe.isValid()) {
            if (!this._pipes.get(id)) {
                this._pipes.set(id, pipe);
            }
        } else {
            pipe.destroy();
            pipe = null;
        }
        return pipe;
        
    },

    /**
     * Removes a pipe
     */
    removePipe: function(/** Pipe */ pipe) {
        this._pipes.unset(pipe.getId());
    },

    /**
     * Returns a pipe instance from its JSON data
     * @type Pipe
     */
    getPipeFromJSON: function(/** Object */ data) {
        return this._pipes.get(this._getPipeIdFromJSON(data));
    },

    /**
     * Returns the list of pipes in which an instance is involved
     * (as the source or the destination)
     * @type Array
     */
    getPipes: function(/** ComponentInstance */ instance) {
        var result = new Array();
        this._pipes.values().each(function(pipe) {
            var found = pipe.getSource().getBuildingblockId() == instance.getId();
            found = found || pipe.getDestination().getBuildingblockId() == instance.getId();
            if (found) {
                result.push(pipe);
            }
        });
        return result;
    },

    /**
     * Hides all the pipes contained in the factory
     */
    hidePipes: function() {
        this._pipes.values().each(function(pipe) {
           pipe.setVisible(false);
        });
    },

    /**
     * Shows all the pipes contained in the screenflow
     */
    showPipes: function() {
         this._pipes.values().each(function(pipe) {
           pipe.setVisible(true);
        });
    },
    
    // **************** PRIVATE METHODS **************** //

    /**
     * Gets a pipe unique id from its endpoints
     * @private
     * @type String
     */
    _getPipeId: function(/** Terminal */ source, /** Terminal */ destination) {
        return source.getBuildingblockUri() + source.getConditionId() +
            destination.getBuildingblockUri() + destination.getActionId() +
            destination.getConditionId();
    },

    /**
     * Gets an id from its json data
     * @private
     * @type String
     */
    _getPipeIdFromJSON: function(/** Object */ data) {
        return data.from.buildingblock + data.from.condition + data.to.buildingblock +
            data.to.action + data.to.condition;
    }
});